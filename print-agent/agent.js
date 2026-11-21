// print-agent/agent.js
// Shawermah Sheesh Local Print Agent
// Bridges cloud/browser orders directly to local network ESC/POS thermal printers

const fs = require("fs");
const path = require("path");
const net = require("net");
const os = require("os");
const { execFile, exec } = require("child_process");

// Resolve dependencies from local or parent project folders
function resolveModule(name) {
  const searchPaths = [
    path.join(__dirname, "node_modules", name),
    path.join(__dirname, "..", "server", "node_modules", name),
    path.join(__dirname, "..", "frontend", "node_modules", name),
  ];
  for (const p of searchPaths) {
    if (fs.existsSync(p)) return require(p);
  }
  return require(name);
}

const express = resolveModule("express");
const cors = resolveModule("cors");
let ioClient = null;
try {
  const socketModule = resolveModule("socket.io-client");
  ioClient = socketModule.io || socketModule;
} catch (e) {
  console.warn("[PrintAgent] socket.io-client not found, running HTTP-only mode.");
}

// Load Configuration
const configPath = path.join(__dirname, "config.json");
let config = {
  port: 3456,
  socketUrl: "https://api.shawermasheesh.com.jo",
  localSocketFallback: "http://localhost:5000",
  printers: {
    shawermah: { name: "طابعة شاورما (كامل الفاتورة)", ip: "192.168.1.56", port: 9100 },
    burger: { name: "طابعة برجر", ip: "192.168.1.55", port: 9100 },
    snack: { name: "طابعة سناك", ip: "192.168.1.57", port: 9100 },
  },
};

if (fs.existsSync(configPath)) {
  try {
    config = { ...config, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  } catch (err) {
    console.error("[PrintAgent] Error reading config.json:", err.message);
  }
}

// Cache of printed orders (orderId -> timestamp) to avoid double-printing within 60s
const printedOrdersCache = new Map();
function isDuplicate(orderId, force = false) {
  if (force || !orderId) return false;
  const now = Date.now();
  if (printedOrdersCache.has(orderId)) {
    const prev = printedOrdersCache.get(orderId);
    if (now - prev < 60000) {
      return true;
    }
  }
  printedOrdersCache.set(orderId, now);
  // cleanup old entries
  if (printedOrdersCache.size > 200) {
    for (const [id, time] of printedOrdersCache.entries()) {
      if (now - time > 120000) printedOrdersCache.delete(id);
    }
  }
  return false;
}

// Low-level TCP socket connection to printer
function sendRawToPrinter(ip, port = 9100, buffer, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let isDone = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, ip, () => {
      socket.write(buffer, () => {
        socket.end();
      });
    });

    socket.on("close", () => {
      if (!isDone) {
        isDone = true;
        resolve({ success: true, ip, port });
      }
    });

    socket.on("error", (err) => {
      if (!isDone) {
        isDone = true;
        socket.destroy();
        reject(new Error(`Printer [${ip}:${port}] error: ${err.message}`));
      }
    });

    socket.on("timeout", () => {
      if (!isDone) {
        isDone = true;
        socket.destroy();
        reject(new Error(`Printer [${ip}:${port}] connection timed out`));
      }
    });
  });
}

// Test TCP connectivity to printer
function testPrinterConnection(ip, port = 9100, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, ip, () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on("error", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });
  });
}

// Get list of installed Windows printers via PowerShell
function getInstalledWindowsPrinters() {
  return new Promise((resolve) => {
    if (process.platform !== "win32") return resolve([]);
    const cmd = `powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Drawing; [System.Drawing.Printing.PrinterSettings]::InstalledPrinters | ConvertTo-Json"`;
    exec(cmd, { timeout: 4000 }, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (_) {
        resolve([]);
      }
    });
  });
}

// Print raw ESC/POS buffer directly to a local Windows / USB printer via spooler
function printRawWindowsPrinter(printerName, buffer) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(
      os.tmpdir(),
      `receipt_${Date.now()}_${Math.random().toString(36).slice(2)}.bin`,
    );
    fs.writeFile(tempFile, buffer, (writeErr) => {
      if (writeErr) return reject(writeErr);
      const psScript = path.join(__dirname, "print-raw-windows.ps1");
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          psScript,
          "-PrinterName",
          printerName,
          "-FilePath",
          tempFile,
        ],
        { timeout: 8000 },
        (err, stdout, stderr) => {
          try {
            fs.unlinkSync(tempFile);
          } catch (_) {}
          if (err || (stdout && stdout.includes("PRINT_FAILED"))) {
            return reject(
              new Error(
                stderr ||
                  stdout ||
                  `Failed to print to Windows printer "${printerName}"`,
              ),
            );
          }
          resolve({ success: true, printerName });
        },
      );
    });
  });
}

// Generate simple test ESC/POS buffer
function generateTestTicket(printerName, ip) {
  const init = Buffer.from([0x1b, 0x40, 0x1b, 0x61, 0x01]); // Init & Center
  const now = new Date().toLocaleString("en-GB");
  const text = `
--------------------------------
    SHAWERMAH SHEESH TEST
      ${printerName}
       IP: ${ip}
    ${now}
     PRINTER TEST OK!
--------------------------------
\n\n\n`;
  const textBuf = Buffer.from(text, "utf8");
  const cut = Buffer.from([0x1d, 0x56, 0x42, 0x00]); // Partial Cut
  return Buffer.concat([init, textBuf, cut]);
}

// Set up Express Server
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 1. Status Endpoint
app.get("/api/status", async (req, res) => {
  const printerStatus = {};
  const windowsPrinters = await getInstalledWindowsPrinters();

  for (const [key, p] of Object.entries(config.printers)) {
    let isOnline = false;
    const isUsb = Boolean(p.type === "usb" || p.printerName || p.ip === "usb");
    if (isUsb) {
      isOnline = p.printerName
        ? windowsPrinters.some(
            (wp) => wp.toLowerCase() === p.printerName.toLowerCase(),
          )
        : windowsPrinters.length > 0;
    } else if (p.ip) {
      isOnline = await testPrinterConnection(p.ip, p.port || 9100);
    }

    printerStatus[key] = {
      name: p.name,
      ip: p.ip || "USB",
      port: p.port || 9100,
      type: isUsb ? "usb" : "network",
      printerName: p.printerName || null,
      online: isOnline,
    };
  }

  res.json({
    agent: "online",
    time: new Date().toISOString(),
    printers: printerStatus,
    windowsPrinters,
  });
});

// List installed Windows printers endpoint
app.get("/api/windows-printers", async (req, res) => {
  const printers = await getInstalledWindowsPrinters();
  res.json({ success: true, printers });
});

// 2. Direct Raw Print Endpoint (Base64 ESC/POS buffer from browser or cloud)
app.post("/api/print-raw", async (req, res) => {
  try {
    const {
      printerIp,
      port = 9100,
      data,
      orderNumber,
      orderId,
      force = false,
      printerKey,
      printerName,
    } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing print data" });
    }

    const configuredPrinter = printerKey ? config.printers[printerKey] : null;
    const targetPrinterName =
      printerName ||
      configuredPrinter?.printerName ||
      (printerIp === "usb" || printerIp === "windows"
        ? config.printers.cashier?.printerName
        : null);

    const isUsb = Boolean(
      targetPrinterName ||
        configuredPrinter?.type === "usb" ||
        printerIp === "usb" ||
        printerIp === "windows",
    );

    // Deduplication check per printer & order
    const orderKey = orderId || orderNumber;
    const dedupeTarget = isUsb
      ? `usb:${targetPrinterName || "cashier"}`
      : printerIp;
    if (orderKey && dedupeTarget) {
      const dedupeKey = `${orderKey}:${dedupeTarget}`;
      if (isDuplicate(dedupeKey, force)) {
        console.log(
          `[PrintAgent] Order #${orderNumber || orderKey} already printed on ${dedupeTarget} within 60s. Skipping duplicate.`,
        );
        return res.json({
          success: true,
          skippedDuplicate: true,
          message: "Duplicate print skipped",
        });
      }
    }

    const buffer = Buffer.from(data, "base64");

    if (isUsb) {
      const pName =
        targetPrinterName ||
        config.printers.cashier?.printerName ||
        (await getInstalledWindowsPrinters())[0];
      if (!pName) {
        throw new Error(
          "USB printer requested but no printerName configured in config.json.",
        );
      }
      console.log(
        `[PrintAgent] Printing job for order #${orderNumber || "---"} -> USB Printer "${pName}" (${buffer.length} bytes)`,
      );
      await printRawWindowsPrinter(pName, buffer);
      return res.json({
        success: true,
        message: `Printed successfully to USB printer "${pName}"`,
      });
    }

    if (!printerIp) {
      return res.status(400).json({ error: "Missing printerIp" });
    }

    console.log(
      `[PrintAgent] Printing job for order #${orderNumber || "---"} -> ${printerIp}:${port} (${buffer.length} bytes)`,
    );

    await sendRawToPrinter(printerIp, port, buffer);

    res.json({
      success: true,
      message: `Printed successfully to ${printerIp}`,
    });
  } catch (err) {
    console.error("[PrintAgent] Print error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Test Print Endpoint
app.post("/api/test-print", async (req, res) => {
  const { printerKey } = req.body;
  const p = config.printers[printerKey];
  if (!p) {
    return res
      .status(400)
      .json({ error: `Printer key "${printerKey}" not found in config` });
  }

  try {
    const isUsb = Boolean(p.type === "usb" || p.printerName || p.ip === "usb");
    const testBuf = generateTestTicket(
      p.name,
      isUsb ? `USB (${p.printerName || "Default"})` : p.ip,
    );

    if (isUsb) {
      const pName = p.printerName || (await getInstalledWindowsPrinters())[0];
      if (!pName) {
        throw new Error(
          `USB Printer "${p.name}" has no printerName set in config.json and no Windows printer found`,
        );
      }
      await printRawWindowsPrinter(pName, testBuf);
      return res.json({
        success: true,
        message: `Test ticket sent to USB Printer "${pName}"`,
      });
    }

    await sendRawToPrinter(p.ip, p.port || 9100, testBuf);
    res.json({
      success: true,
      message: `Test ticket sent to ${p.name} (${p.ip})`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Web Dashboard UI for Cashier / Admin PC
app.get("/", async (req, res) => {
  const windowsPrinters = await getInstalledWindowsPrinters();
  const printersList = Object.entries(config.printers)
    .map(([key, p]) => {
      const isUsb = Boolean(p.type === "usb" || p.printerName || p.ip === "usb");
      return `
      <div class="card">
        <h3>${p.name}</h3>
        <p><strong>النوع:</strong> ${isUsb ? `USB (${p.printerName || "غير محدد"})` : `شبكة (${p.ip}:${p.port || 9100})`}</p>
        <button onclick="testPrint('${key}')">طباعة تجريبية (Test Print)</button>
      </div>`;
    })
    .join("");

  const wpBadges =
    windowsPrinters.length > 0
      ? windowsPrinters
          .map(
            (wp) =>
              `<span style="display:inline-block; background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 12px; margin:4px; font-weight:bold; font-size:13px; color:#1e293b;">🖨️ ${wp}</span>`,
          )
          .join("")
      : "<p style='color:#64748b;'>لم يتم العثور على طابعات USB معرفة على هذا الجهاز.</p>";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>خادم الطباعة - شاورما شيش</title>
  <style>
    body { font-family: Tahoma, sans-serif; background: #f4f6f8; padding: 30px; margin: 0; direction: rtl; }
    .container { max-width: 800px; margin: auto; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; text-align: center; margin-bottom: 8px; }
    p.sub { text-align: center; color: #64748b; margin-top: 0; }
    .status-banner { background: #ecfdf5; border: 1px solid #10b981; padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; color: #065f46; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin: 25px 0; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; text-align: center; }
    .card h3 { margin: 0 0 10px 0; color: #0f172a; }
    button { background: #0284c7; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; }
    button:hover { background: #0369a1; }
    .log-box { background: #0f172a; color: #38bdf8; font-family: monospace; padding: 15px; border-radius: 8px; height: 160px; overflow-y: auto; text-align: left; direction: ltr; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>خادم الطباعة المحلي - شاورما شيش</h1>
    <p class="sub">متصل بالطابعات الشبكية و USB ومستعد لاستقبال الفواتير تلقائياً</p>
    
    <div class="status-banner">
      ✓ خادم الطباعة يعمل ومستعد لإرسال الفواتير إلى طابعات المطعم: ${Object.values(config.printers).map(p => `${p.name} (${p.ip || p.printerName || "USB"})`).join(" | ")}
    </div>

    <div class="grid">
      ${printersList}
    </div>

    <h3>طابعات الويندوز المكتشفة على هذا الجهاز (USB):</h3>
    <div style="background:#f1f5f9; padding:12px; border-radius:8px; margin-bottom:20px;">
      ${wpBadges}
    </div>

    <h3>سجل الطباعة المباشر:</h3>
    <div id="log" class="log-box">Print agent is ready. Listening on port ${config.port}...</div>
  </div>
  <script>
    function log(msg) {
      const box = document.getElementById("log");
      box.innerHTML += "<br>> " + msg;
      box.scrollTop = box.scrollHeight;
    }
    async function testPrint(key) {
      log("Sending test print to " + key + "...");
      try {
        const res = await fetch("/api/test-print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ printerKey: key })
        });
        const data = await res.json();
        if (data.success) {
          log("SUCCESS: " + data.message);
        } else {
          log("ERROR: " + data.error);
        }
      } catch (e) {
        log("FAILED: " + e.message);
      }
    }
  </script>
</body>
</html>`;
  res.send(html);
});

// Start listening
const server = app.listen(config.port, () => {
  console.log(`[PrintAgent] Running on http://127.0.0.1:${config.port}`);
  for (const [key, p] of Object.entries(config.printers)) {
    console.log(`[PrintAgent] ${p.name.padEnd(20)}: ${p.ip}:${p.port || 9100}`);
  }
});

// Connect to Socket.IO Server (DigitalOcean or local)
if (ioClient) {
  const tryConnectSocket = (url) => {
    console.log(`[PrintAgent] Connecting to Socket.IO at ${url}...`);
    const socket = ioClient(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(`[PrintAgent] Connected to Socket.IO server at ${url}!`);
    });

    socket.on("connect_error", (err) => {
      console.warn(`[PrintAgent] Socket connection error (${url}):`, err.message);
    });

    // Handle autoPrintOrder event
    socket.on("autoPrintOrder", async (order) => {
      if (!order || !order._id) return;
      if (isDuplicate(order._id, order.force)) {
        console.log(`[PrintAgent] Order #${order.sequenceNumber} already printed recently, skipping duplicate.`);
        return;
      }

      console.log(`[PrintAgent] Received autoPrintOrder for Order #${order.sequenceNumber}`);
    });

    return socket;
  };

  const primarySocket = tryConnectSocket(config.socketUrl);
}
