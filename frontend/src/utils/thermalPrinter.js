// frontend/src/utils/thermalPrinter.js
// Automatic ESC/POS Network Printing for Shawermah Sheesh (80mm Thermal Printers)

export const PRINTER_CONFIG = {
  agentUrl: "http://127.0.0.1:3456",
  printers: {
    shawermah: {
      id: "shawermah",
      name: "طابعة شاورما",
      badge: "قسم الشاورما",
      ip: "192.168.1.56",
      port: 9100,
    },
    burger: {
      id: "burger",
      name: "طابعة برجر",
      badge: "مطبخ البرجر",
      ip: "192.168.1.55",
      port: 9100,
    },
    snack: {
      id: "snack",
      name: "طابعة سناك",
      badge: "محطة السناك",
      ip: "192.168.1.57",
      port: 9100,
    },
    cafe: {
      id: "cafe",
      name: "طابعة كافيه",
      badge: "كافيه وحلويات شيش",
      ip: "192.168.1.60",
      port: 9100,
    },
    cashier: {
      id: "cashier",
      name: "طابعة الكاشير 1",
      badge: "فاتورة الزبون / كاشير 1",
      ip: "192.168.1.54",
      port: 9100,
    },
    cashier2: {
      id: "cashier2",
      name: "طابعة الكاشير 2",
      badge: "فاتورة الزبون / كاشير 2",
      ip: "192.168.1.53",
      port: 9100,
    },
  },
};

/**
 * Product-specific overrides (takes precedence over category mapping):
 * - Product "69d8f37b0d197335a04b3fc5" (فتة شيش): Shawarma printer
 * - Product "69d8e8860d197335a04b3f52" (سناك بوكس): Snacks printer
 */
export const PRODUCT_PRINTER_OVERRIDES = {
  "69d8f37b0d197335a04b3fc5": "shawermah", // فتة شيش
  "69d8e8860d197335a04b3f52": "snack",     // سناك بوكس
};

/**
 * Category IDs assigned to specific station printers:
 * - Snacks:
 *    - "69d8e98d0d197335a04b3f61" (سناكات)
 *    - "6a4556bb1d418c5cf3980821" (مأكولات بحرية)
 *    - "69d8f3530d197335a04b3fc2" (اطباق شيش - ما عدا فتة شيش التي تطبع على طابعة الشاورما)
 * - Burgers:
 *    - "69d8ede10d197335a04b3f95" (برجر لحم)
 *    - "69d8f0530d197335a04b3faa" (برجر دجاج)
 *    - "69d8f3e20d197335a04b3fce" (وجبات الأطفال)
 *    - "69d8e83f0d197335a04b3f4f" (وجبات جماعية - ما عدا سناك بوكس الذي يطبع على طابعة السناك)
 * - Cafe:
 *    - "6a4fb60b6774757996012c41" (كافية وحلويات شيش)
 * - Shawermah: All other category IDs
 */
export const CATEGORY_PRINTER_MAPPING = {
  snack: [
    "69d8e98d0d197335a04b3f61", // سناكات
    "6a4556bb1d418c5cf3980821", // مأكولات بحرية
    "69d8f3530d197335a04b3fc2", // اطباق شيش (باستثناء فتة شيش)
  ],
  burger: [
    "69d8ede10d197335a04b3f95", // برجر لحم
    "69d8f0530d197335a04b3faa", // برجر دجاج
    "69d8f3e20d197335a04b3fce", // وجبات الأطفال
    "69d8e83f0d197335a04b3f4f", // وجبات جماعية (باستثناء سناك بوكس)
  ],
  cafe: ["6a4fb60b6774757996012c41"], // كافية وحلويات شيش
};

/**
 * Extracts product ID from an order item
 */
export function getItemProductId(item) {
  if (!item) return null;
  const p = item.productId;
  if (!p) return null;
  if (typeof p === "object" && (p._id || p.id)) {
    return String(p._id || p.id);
  }
  return String(p);
}

/**
 * Extracts category ID from an order item
 */
export function getItemCategoryId(item) {
  if (!item) return null;

  // 1. From item.productId.category (populated object or raw ObjectId)
  const productCategory = item.productId?.category;
  if (productCategory) {
    if (typeof productCategory === "string") return productCategory;
    if (productCategory._id) return String(productCategory._id);
    if (productCategory.id) return String(productCategory.id);
    return String(productCategory);
  }

  // 2. From item.category (populated object or raw string/ObjectId)
  if (item.category) {
    if (typeof item.category === "string") return item.category;
    if (item.category._id) return String(item.category._id);
    if (item.category.id) return String(item.category.id);
    return String(item.category);
  }

  // 3. Fallbacks if categoryId field exists directly
  if (item.categoryId) return String(item.categoryId);
  if (item.productId?.categoryId) return String(item.productId.categoryId);

  return null;
}

/**
 * Classifies an item into: "snack", "burger", "cafe", or "shawermah" (default)
 * Strictly based on product overrides and category IDs.
 */
export function classifyItem(item) {
  // 1. Check specific product overrides first
  const prodId = getItemProductId(item);
  if (prodId && PRODUCT_PRINTER_OVERRIDES[prodId]) {
    return PRODUCT_PRINTER_OVERRIDES[prodId];
  }

  // 2. Check category mapping
  const catId = getItemCategoryId(item);
  if (catId) {
    if (CATEGORY_PRINTER_MAPPING.snack.includes(catId)) {
      return "snack";
    }
    if (CATEGORY_PRINTER_MAPPING.burger.includes(catId)) {
      return "burger";
    }
    if (CATEGORY_PRINTER_MAPPING.cafe.includes(catId)) {
      return "cafe";
    }
    return "shawermah";
  }

  return "shawermah";
}

/**
 * Splits the order into print jobs for the 4 printers according to category IDs:
 *  - 192.168.1.57 (Snack): Items under category "69d8e98d0d197335a04b3f61"
 *  - 192.168.1.55 (Burger): Items under categories "69d8ede10d197335a04b3f95", "69d8f0530d197335a04b3faa", "69d8f3e20d197335a04b3fce"
 *  - 192.168.1.60 (Cafe): Items under category "6a4fb60b6774757996012c41"
 *  - 192.168.1.56 (Shawermah): Any other item under other category IDs
 */
export function splitOrderForPrinters(order) {
  const allProducts = Array.isArray(order?.products) ? order.products : [];

  const snackProducts = allProducts.filter((p) => classifyItem(p) === "snack");
  const burgerProducts = allProducts.filter((p) => classifyItem(p) === "burger");
  const cafeProducts = allProducts.filter((p) => classifyItem(p) === "cafe");
  const shawermahProducts = allProducts.filter((p) => classifyItem(p) === "shawermah");

  const jobs = [];

  // 1. Shawermah printer (192.168.1.56) -> Prints other categories
  if (shawermahProducts.length > 0) {
    jobs.push({
      printer: PRINTER_CONFIG.printers.shawermah,
      products: shawermahProducts,
      isFullInvoice: false,
      badge: PRINTER_CONFIG.printers.shawermah.badge,
    });
  }

  // 2. Burger printer (192.168.1.55) -> Prints burger categories
  if (burgerProducts.length > 0) {
    jobs.push({
      printer: PRINTER_CONFIG.printers.burger,
      products: burgerProducts,
      isFullInvoice: false,
      badge: PRINTER_CONFIG.printers.burger.badge,
    });
  }

  // 3. Snack printer (192.168.1.57) -> Prints snack category
  if (snackProducts.length > 0) {
    jobs.push({
      printer: PRINTER_CONFIG.printers.snack,
      products: snackProducts,
      isFullInvoice: false,
      badge: PRINTER_CONFIG.printers.snack.badge,
    });
  }

  // 4. Cafe printer (192.168.1.60) -> Prints cafe category
  if (cafeProducts.length > 0) {
    jobs.push({
      printer: PRINTER_CONFIG.printers.cafe,
      products: cafeProducts,
      isFullInvoice: false,
      badge: PRINTER_CONFIG.printers.cafe.badge,
    });
  }

  return jobs;
}

/**
 * Wraps text for canvas rendering
 */
function wrapText(ctx, text, maxWidth) {
  const words = String(text || "").split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Renders an invoice receipt onto an HTML5 Canvas with perfect Arabic typography
 * Standard 80mm roll = 576 dots printable width
 */
export function renderReceiptToCanvas(order, job) {
  const width = 576; // 80mm @ 203 DPI
  const padding = 20;
  const contentWidth = width - padding * 2;

  // Measure content first to calculate dynamic canvas height
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  const ctx = offscreen.getContext("2d");

  const customerName = order.userDetails?.name || "N/A";
  const customerPhone =
    order.userId?.phone || order.userDetails?.phone || "N/A";
  const deliveryType =
    order.orderType === "delivery" ? "توصيل (Delivery)" : "استلام (Pickup)";
  const area =
    order.shippingAddress?.name || order.userDetails?.apartment || "";
  const orderSource =
    order.source === "ishbek" ? "طلبات (اشبك - Talabat)" : "تطبيق شاورما شيش";

  // Kitchen preparation printers (shawarma, snacks, burger, cafe) do NOT display any prices or totals.
  // Only Cashier printers display prices and financial totals.
  const isCashierInvoice = Boolean(
    job.isFullInvoice ||
    job.printer?.id === "cashier" ||
    job.printer?.id === "cashier2"
  );
  const showPrices = isCashierInvoice;

  // Pre-calculate height
  let estimatedHeight = 360; // Header, info, titles, dividers
  const products = job.products || [];

  products.forEach((item) => {
    estimatedHeight += 70; // Item name + Qty line
    if (item.selectedProtein) estimatedHeight += 24;
    if (item.isSpicy) estimatedHeight += 24;
    if (item.additions?.length > 0) estimatedHeight += 28;
    if (item.notes || order.orderNote) estimatedHeight += 30;
  });

  if (showPrices) {
    estimatedHeight += 220; // Totals (Subtotal, Discount, Delivery fee, Grand total)
  } else {
    estimatedHeight += 70; // Bottom divider and footer
  }

  offscreen.height = estimatedHeight;

  // Fill background with white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, estimatedHeight);

  // Text settings
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";
  ctx.direction = "rtl";

  let y = 16;

  // 1. Restaurant Header
  ctx.font = "bold 32px Tahoma, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("شاورما شيش", width / 2, y);
  y += 38;

  ctx.font = "bold 18px Arial, sans-serif";
  ctx.fillText("Shawarma Sheesh", width / 2, y);
  y += 28;

  // Station Badge Box
  const badgeText = `[ ${job.badge || "فاتورة"} ]`;
  ctx.font = "bold 22px Tahoma, Arial, sans-serif";
  ctx.fillText(badgeText, width / 2, y);
  y += 34;

  // Order Number (Large and Prominent)
  const seqNum = order.sequenceNumber != null ? `#${order.sequenceNumber}` : "#---";
  ctx.font = "bold 36px Tahoma, Arial, sans-serif";
  ctx.fillText(`طلب رقم: ${seqNum}`, width / 2, y);
  y += 44;

  // Date & Time
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("en-CA")}  ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  ctx.font = "16px Tahoma, Arial, sans-serif";
  ctx.fillText(dateStr, width / 2, y);
  y += 28;

  // Divider Line
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 10;

  // 2. Customer & Order Info
  ctx.textAlign = "right";
  ctx.font = "bold 18px Tahoma, Arial, sans-serif";

  const drawInfoRow = (label, value) => {
    if (!value) return;
    ctx.font = "bold 17px Tahoma, Arial, sans-serif";
    ctx.fillText(`${label}: `, width - padding, y);
    const labelWidth = ctx.measureText(`${label}: `).width;
    ctx.font = "17px Tahoma, Arial, sans-serif";
    ctx.fillText(String(value), width - padding - labelWidth, y);
    y += 26;
  };

  drawInfoRow("الزبون", customerName);
  drawInfoRow("الهاتف", customerPhone);
  drawInfoRow("نوع الطلب", deliveryType);
  if (order.orderType === "delivery" && area) {
    drawInfoRow("المنطقة", area);
  }
  drawInfoRow("المصدر", orderSource);

  y += 6;

  // Dashed Divider
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 12;

  // 3. Products Table Header
  ctx.font = "bold 18px Tahoma, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("الصنف", width - padding, y);

  if (showPrices) {
    ctx.textAlign = "center";
    ctx.fillText("العدد", width / 2 + 30, y);

    ctx.textAlign = "left";
    ctx.fillText("السعر", padding, y);
  } else {
    // For kitchen tickets without prices: show "العدد" prominently on the left
    ctx.textAlign = "left";
    ctx.fillText("العدد", padding + 15, y);
  }
  y += 26;

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();
  y += 10;

  // 4. Products List
  products.forEach((item, idx) => {
    const itemName =
      item.productId?.name?.ar ||
      item.name?.ar ||
      item.productId?.name?.en ||
      item.name?.en ||
      item.name ||
      "وجبة";

    const itemPrice = (Number(item.priceAtPurchase || 0) * (item.quantity || 1)).toFixed(2);

    // Item name wrapped (wider area when prices are omitted)
    ctx.font = "bold 20px Tahoma, Arial, sans-serif";
    ctx.textAlign = "right";
    const nameLines = wrapText(ctx, itemName, showPrices ? contentWidth - 160 : contentWidth - 90);

    nameLines.forEach((line, lIdx) => {
      ctx.fillText(line, width - padding, y);
      if (lIdx === 0) {
        if (showPrices) {
          // Quantity on first line
          ctx.textAlign = "center";
          ctx.font = "bold 22px Arial, sans-serif";
          ctx.fillText(String(item.quantity || 1), width / 2 + 30, y);

          // Price on first line
          ctx.textAlign = "left";
          ctx.font = "bold 19px Arial, sans-serif";
          ctx.fillText(`${itemPrice} JOD`, padding, y);
        } else {
          // Kitchen ticket without price: large prominent quantity on left
          ctx.textAlign = "left";
          ctx.font = "bold 26px Arial, sans-serif";
          ctx.fillText(`x ${item.quantity || 1}`, padding + 15, y);
        }

        ctx.textAlign = "right";
        ctx.font = "bold 20px Tahoma, Arial, sans-serif";
      }
      y += 24;
    });

    // Protein Choice
    if (item.selectedProtein) {
      ctx.font = "16px Tahoma, Arial, sans-serif";
      ctx.fillText(`• البروتين: ${item.selectedProtein === "meat" ? "لحمة" : "دجاج"}`, width - padding - 15, y);
      y += 22;
    }

    // Spicy
    if (item.isSpicy) {
      ctx.font = "bold 16px Tahoma, Arial, sans-serif";
      ctx.fillText("• حار (Spicy) 🌶️", width - padding - 15, y);
      y += 22;
    }

    // Additions
    if (item.additions && item.additions.length > 0) {
      const addText = item.additions
        .map((a) => a.name?.ar || a.name?.en || a.name || "")
        .filter(Boolean)
        .join("، ");
      if (addText) {
        ctx.font = "16px Tahoma, Arial, sans-serif";
        const addLines = wrapText(ctx, `• إضافات: ${addText}`, contentWidth - 30);
        addLines.forEach((ln) => {
          ctx.fillText(ln, width - padding - 15, y);
          y += 22;
        });
      }
    }

    // Notes
    const noteText = [item.notes, idx === 0 ? order.orderNote : ""]
      .filter(Boolean)
      .join(" - ");
    if (noteText) {
      ctx.font = "italic 16px Tahoma, Arial, sans-serif";
      const noteLines = wrapText(ctx, `• ملاحظة: ${noteText}`, contentWidth - 30);
      noteLines.forEach((ln) => {
        ctx.fillText(ln, width - padding - 15, y);
        y += 22;
      });
    }

    y += 8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 10;
  });

  if (showPrices) {
    // 5. Totals Section (Only for Cashier customer invoice)
    const subtotal = (
      (order.totalPrice || 0) -
      (order.shippingAddress?.deliveryCost || 0) +
      (order.discountAmount || 0)
    ).toFixed(2);

    const drawTotalRow = (label, valStr, isBold = false, fontSize = 18) => {
      ctx.font = `${isBold ? "bold " : ""}${fontSize}px Tahoma, Arial, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(label, width - padding, y);
      ctx.textAlign = "left";
      ctx.fillText(valStr, padding, y);
      y += fontSize + 8;
    };

    drawTotalRow("المجموع الفرعي:", `${subtotal} JOD`, false, 18);

    if (order.discountAmount > 0) {
      const promoLabel = `خصم الكود${order.promoCode ? ` (${order.promoCode})` : ""}:`;
      drawTotalRow(promoLabel, `- ${Number(order.discountAmount).toFixed(2)} JOD`, false, 18);
    }

    if (order.orderType === "delivery") {
      const delFee = Number(order.shippingAddress?.deliveryCost || 0).toFixed(2);
      drawTotalRow("أجور التوصيل:", `${delFee} JOD`, false, 18);
    }

    y += 6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 10;

    // Grand Total
    drawTotalRow(
      "المجموع الكلي:",
      `${Number(order.totalPrice || 0).toFixed(2)} JOD`,
      true,
      28,
    );

    y += 12;
  } else {
    // Kitchen preparation tickets: no prices or totals, just a clean closing divider
    y += 4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    y += 14;
  }

  // 6. Footer
  ctx.textAlign = "center";
  ctx.font = "bold 20px Tahoma, Arial, sans-serif";
  ctx.fillText("شكراً لطلبكم من شاورما شيش!", width / 2, y);
  y += 28;

  ctx.font = "15px Arial, sans-serif";
  ctx.fillText("www.shawermasheesh.com.jo", width / 2, y);
  y += 30;

  // Crop canvas to actual rendered height
  const actualHeight = Math.ceil(y);
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = actualHeight;
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.drawImage(offscreen, 0, 0, width, actualHeight, 0, 0, width, actualHeight);

  return finalCanvas;
}

/**
 * Converts a Canvas to standard ESC/POS Raster bitmap command (GS v 0) with Paper Cut
 */
export function canvasToEscPosRaster(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const widthBytes = Math.ceil(width / 8);

  // ESC/POS Commands:
  // ESC @: Initialize printer
  // ESC a 1: Center align
  // GS v 0 0: Raster image normal mode
  const header = [
    0x1b,
    0x40,
    0x1b,
    0x61,
    0x01,
    0x1d,
    0x76,
    0x30,
    0x00,
    widthBytes & 0xff,
    (widthBytes >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff,
  ];

  const rasterBytes = new Uint8Array(widthBytes * height);

  for (let y = 0; y < height; y++) {
    for (let xByte = 0; xByte < widthBytes; xByte++) {
      let byteVal = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = xByte * 8 + bit;
        if (x < width) {
          const idx = (y * width + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          // Grayscale threshold: darker than 185 is black dot (1)
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 185) {
            byteVal |= 1 << (7 - bit);
          }
        }
      }
      rasterBytes[y * widthBytes + xByte] = byteVal;
    }
  }

  // Footer: Feed 4 lines and Partial Cut (GS V B 0)
  const footer = [0x1b, 0x64, 0x04, 0x1d, 0x56, 0x42, 0x00];

  const totalLength = header.length + rasterBytes.length + footer.length;
  const finalBuffer = new Uint8Array(totalLength);
  finalBuffer.set(header, 0);
  finalBuffer.set(rasterBytes, header.length);
  finalBuffer.set(footer, header.length + rasterBytes.length);

  return finalBuffer;
}

/**
 * Converts Uint8Array to base64 string
 */
function uint8ToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// In-memory deduplication cache: maps orderKey (orderId or sequenceNumber) -> timestamp
const recentlyPrintedCache = new Map();
const COOLDOWN_MS = 30000; // 30 seconds cooldown between automatic duplicate prints

export function isRecentlyPrinted(orderKey, force = false) {
  if (force || !orderKey) return false;
  const lastTime = recentlyPrintedCache.get(String(orderKey));
  const now = Date.now();
  if (lastTime && now - lastTime < COOLDOWN_MS) {
    return true;
  }
  return false;
}

export function markRecentlyPrinted(orderKey) {
  if (!orderKey) return;
  const now = Date.now();
  recentlyPrintedCache.set(String(orderKey), now);

  // Clean old entries (older than 5 minutes)
  if (recentlyPrintedCache.size > 200) {
    for (const [key, time] of recentlyPrintedCache.entries()) {
      if (now - time > 300000) {
        recentlyPrintedCache.delete(key);
      }
    }
  }
}

/**
 * Dispatches a raw print buffer to a printer IP via the local print agent
 */
export async function sendJobToPrinter(printerIp, rawUint8Array, orderNumber, orderId, force = false) {
  const base64Data = uint8ToBase64(rawUint8Array);
  const response = await fetch(`${PRINTER_CONFIG.agentUrl}/api/print-raw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printerIp,
      port: 9100,
      orderNumber,
      orderId,
      force,
      data: base64Data,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to print to ${printerIp}: ${errorText}`);
  }

  return response.json();
}

/**
 * Automatically prints an order across the network printers with duplicate prevention.
 * Pass options.force = true for manual button reprints.
 */
export async function autoPrintOrder(order, options = {}) {
  if (!order) return { success: false, message: "No order provided" };

  const force = options.force === true;
  const orderKey = String(order._id || order.sequenceNumber || "");

  // Prevent double printing within cooldown
  if (orderKey && !force) {
    if (isRecentlyPrinted(orderKey)) {
      console.log(`[ThermalPrint] Order #${order.sequenceNumber || orderKey} was already printed recently. Skipping duplicate.`);
      return { success: true, skippedDuplicate: true, message: "تمت طباعة هذا الطلب بالفعل" };
    }
    markRecentlyPrinted(orderKey);
  }

  const jobs = splitOrderForPrinters(order);
  const results = [];

  for (const job of jobs) {
    try {
      const canvas = renderReceiptToCanvas(order, job);
      const rawBytes = canvasToEscPosRaster(canvas);
      const res = await sendJobToPrinter(
        job.printer.ip,
        rawBytes,
        order.sequenceNumber,
        order._id,
        force,
      );
      results.push({ printer: job.printer.id, ip: job.printer.ip, success: true, res });
    } catch (err) {
      console.error(`[ThermalPrint] Failed to print on ${job.printer.name}:`, err);
      results.push({
        printer: job.printer.id,
        ip: job.printer.ip,
        success: false,
        error: err.message,
      });
    }
  }

  return { success: true, jobsCount: jobs.length, results };
}

let currentDeviceCashierIp = "192.168.1.54";

/**
 * Updates the cached cashier IP for the current device (from print agent or localStorage)
 */
export function setDeviceCashierIp(ip) {
  if (ip && typeof ip === "string") {
    currentDeviceCashierIp = ip;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selected_cashier_printer_ip", ip);
      } catch (e) {}
    }
  }
}

/**
 * Returns the currently active cashier printer IP for this device
 */
export function getDeviceCashierIp() {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("selected_cashier_printer_ip");
      if (saved) return saved;
    } catch (e) {}
  }
  return currentDeviceCashierIp || "192.168.1.54";
}

/**
 * Prints the complete customer invoice (all items from all categories)
 * to ONLY the Cashier printer connected to the current device (never both).
 */
export async function printCashierInvoice(order, options = {}) {
  if (!order) return { success: false, message: "No order provided" };

  const allProducts = Array.isArray(order?.products) ? order.products : [];
  if (allProducts.length === 0) {
    return { success: false, message: "الطلب لا يحتوي على أصناف" };
  }

  // Determine the single target cashier printer for the current device
  let targetPrinter = null;
  const desiredIp =
    options.printerIp ||
    (options.printer && options.printer.ip) ||
    getDeviceCashierIp();

  targetPrinter = Object.values(PRINTER_CONFIG.printers).find((p) => p.ip === desiredIp);

  if (!targetPrinter) {
    targetPrinter = options.printer || PRINTER_CONFIG.printers.cashier;
  }

  const force = options.force !== false; // manual print on cashier should always proceed

  const cashierJob = {
    printer: targetPrinter,
    products: allProducts,
    isFullInvoice: true,
    badge: targetPrinter.badge || "فاتورة الزبون",
  };

  try {
    const canvas = renderReceiptToCanvas(order, cashierJob);
    const rawBytes = canvasToEscPosRaster(canvas);
    const res = await sendJobToPrinter(
      targetPrinter.ip,
      rawBytes,
      order.sequenceNumber,
      order._id,
      force,
    );
    return {
      success: true,
      printer: targetPrinter.name,
      ip: targetPrinter.ip,
      res,
    };
  } catch (err) {
    console.error(`[ThermalPrint] Failed to print cashier invoice on ${targetPrinter.name} (${targetPrinter.ip}):`, err);
    return {
      success: false,
      printer: targetPrinter.name,
      ip: targetPrinter.ip,
      error: err.message,
    };
  }
}

/**
 * Checks the status of the local print agent and network printers
 */
export async function checkPrintAgentStatus() {
  try {
    const res = await fetch(`${PRINTER_CONFIG.agentUrl}/api/status`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.deviceCashierIp) {
        currentDeviceCashierIp = data.deviceCashierIp;
      }
      return data;
    }
    return { online: false, error: `HTTP ${res.status}` };
  } catch (e) {
    return { online: false, error: e.message };
  }
}
