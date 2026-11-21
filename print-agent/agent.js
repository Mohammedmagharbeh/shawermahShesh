// print-agent/agent.js
// Shawermah Sheesh Local Print Agent
// Bridges cloud/browser orders directly to local network ESC/POS thermal printers

const fs = require("fs");
const path = require("path");
const net = require("net");

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
  console.warn(
    "[PrintAgent] socket.io-client not found, running HTTP-only mode.",
  );
}

// Load Configuration
const configPath = path.join(__dirname, "config.json");
let config = {
  port: 3456,
  socketUrl: "https://api.shawermasheesh.com.jo",
  localSocketFallback: "http://localhost:5000",
  printers: {
    shawermah: { name: "طابعة شاورما", ip: "192.168.1.56", port: 9100 },
    burger: { name: "طابعة برجر", ip: "192.168.1.55", port: 9100 },
    snack: { name: "طابعة سناك", ip: "192.168.1.57", port: 9100 },
    cafe: { name: "طابعة كافيه", ip: "192.168.1.60", port: 9100 },
    cashier: { name: "طابعة الكاشير 1", ip: "192.168.1.54", port: 9100 },
    cashier2: { name: "طابعة الكاشير 2", ip: "192.168.1.53", port: 9100 },
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
  for (const [key, p] of Object.entries(config.printers)) {
    const isOnline = await testPrinterConnection(p.ip, p.port || 9100);
    printerStatus[key] = {
      name: p.name,
      ip: p.ip,
      port: p.port || 9100,
      online: isOnline,
    };
  }

  const deviceCashierIp = config.deviceCashierIp || config.printers.cashier?.ip || "192.168.1.54";

  res.json({
    agent: "online",
    time: new Date().toISOString(),
    deviceCashierIp,
    printers: printerStatus,
  });
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
    } = req.body;

    if (!printerIp || !data) {
      return res.status(400).json({ error: "Missing printerIp or data" });
    }

    // Deduplication check per printer & order: e.g. "65abc_192.168.1.56"
    const orderKey = orderId || orderNumber;
    if (orderKey) {
      const dedupeKey = `${orderKey}:${printerIp}`;
      if (isDuplicate(dedupeKey, force)) {
        console.log(
          `[PrintAgent] Order #${orderNumber || orderKey} already printed on ${printerIp} within 30s. Skipping duplicate.`,
        );
        return res.json({
          success: true,
          skippedDuplicate: true,
          message: "Duplicate print skipped",
        });
      }
    }

    const buffer = Buffer.from(data, "base64");
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
    const testBuf = generateTestTicket(p.name, p.ip);
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
  const printersList = Object.entries(config.printers)
    .map(
      ([key, p]) => `
      <div class="card">
        <h3>${p.name}</h3>
        <p><strong>IP:</strong> ${p.ip}:${p.port || 9100}</p>
        <button onclick="testPrint('${key}')">طباعة تجريبية (Test Print)</button>
      </div>`,
    )
    .join("");

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
    <p class="sub">متصل بالطابعات الشبكية ومستعد لاستقبال الفواتير تلقائياً عند قبول الطلب</p>
    
    <div class="status-banner">
      ✓ خادم الطباعة يعمل ومستعد لإرسال الفواتير إلى طابعات المطعم: ${Object.values(
        config.printers,
      )
        .map((p) => `${p.name} (${p.ip})`)
        .join(" | ")}
    </div>

    <div class="grid">
      ${printersList}
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
      console.warn(
        `[PrintAgent] Socket connection error (${url}):`,
        err.message,
      );
    });

    // Handle autoPrintOrder event
    socket.on("autoPrintOrder", async (order) => {
      if (!order || !order._id) return;
      if (isDuplicate(order._id, order.force)) {
        console.log(
          `[PrintAgent] Order #${order.sequenceNumber} already printed recently, skipping duplicate.`,
        );
        return;
      }

      console.log(
        `[PrintAgent] Received autoPrintOrder for Order #${order.sequenceNumber}`,
      );
    });

    return socket;
  };

  const primarySocket = tryConnectSocket(config.socketUrl);
}
