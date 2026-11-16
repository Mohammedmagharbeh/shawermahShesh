// بيعدّل AdminDashboard و DispatchQueue تلقائياً:
//  - طلبات اشبك (طلبات) بتظهر بطريقة دفع "card" ومدفوعة بالداشبورد
//  - طلبات اشبك بتظهر بصفحة الإرسال مع علامة Talabat وعنوانها
// الاستعمال: حط الملف بمجلد المشروع (جنب frontend و server) وشغّل: node patch-dashboard.js
// بيعمل نسخة احتياطية جنب كل ملف باسم الملف.bak

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", "dist", "build", ".next"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx|tsx|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findFile(files, needle) {
  return files.find((f) => {
    try {
      return fs.readFileSync(f, "utf8").includes(needle);
    } catch (e) {
      return false;
    }
  });
}

function swapAll(text, from, to) {
  return text.split(from).join(to);
}

function applyPatches(file, patches, doneMarker) {
  const raw = fs.readFileSync(file, "utf8");
  const crlf = raw.includes("\r\n");
  let text = raw.replace(/\r\n/g, "\n");

  console.log("\n" + path.relative(ROOT, file));
  if (text.includes(doneMarker)) {
    console.log("  (معدّل من قبل، تخطيته)");
    return;
  }

  let ok = 0;
  for (const p of patches) {
    const before = text;
    text = p.run(text);
    if (text === before) {
      console.log("  ✗ ما لقيت المكان: " + p.name);
    } else {
      console.log("  ✓ " + p.name);
      ok += 1;
    }
  }

  if (ok === 0) {
    console.log("  ما تغيّر شي.");
    return;
  }
  fs.writeFileSync(file + ".bak", raw, "utf8");
  fs.writeFileSync(file, crlf ? text.replace(/\n/g, "\r\n") : text, "utf8");
  console.log("  تم الحفظ، والنسخة الاحتياطية: " + path.basename(file) + ".bak");
}

const HELPERS = `

// طريقة الدفع المعروضة: طلبات اشبك (طلبات) دائماً بطاقة ومدفوعة
const getPaymentMethod = (order) =>
  order.source === "ishbek" ? "card" : order.payment?.method || "N/A";

const getPaymentStatus = (order) =>
  order.source === "ishbek" ? "paid" : order.payment?.status || "unpaid";`;

const adminPatches = [
  {
    name: "إضافة دوال طريقة الدفع",
    run: (t) => t.replace(/const channelLabels = \{[\s\S]*?\n\};/, (m) => m + HELPERS),
  },
  {
    name: "فلتر الطلبات الجديدة (fetchPendingOrders)",
    run: (t) =>
      swapAll(
        t,
        '(o) => o.payment?.method === "cash" || o.payment?.status === "paid",',
        '(o) =>\n          o.source === "ishbek" ||\n          o.payment?.method === "cash" ||\n          o.payment?.status === "paid",'
      ),
  },
  {
    name: "فلتر عرض الطلبات (matchesPayment)",
    run: (t) =>
      swapAll(
        t,
        'order.payment?.method === "cash" || order.payment?.status === "paid";',
        'order.source === "ishbek" ||\n        order.payment?.method === "cash" ||\n        order.payment?.status === "paid";'
      ),
  },
  {
    name: "قيمة قائمة حالة الدفع",
    run: (t) =>
      swapAll(t, 'value={order.payment?.status || "unpaid"}', "value={getPaymentStatus(order)}"),
  },
  {
    name: "لون شارة الدفع",
    run: (t) =>
      t.replace(
        /order\.payment\?\.status === "paid"(\s*\? "bg-green-600 text-white")/,
        (m, g1) => 'getPaymentStatus(order) === "paid"' + g1
      ),
  },
  {
    name: "نص شارة الدفع",
    run: (t) =>
      t.replace(
        /\{order\.payment\?\.status\s*\? t\(order\.payment\.status\)\s*: t\("unpaid"\)\}\{" "\}\s*\(\{order\.payment\?\.method \|\| "N\/A"\}\)/,
        () => "{t(getPaymentStatus(order))} ({getPaymentMethod(order)})"
      ),
  },
  {
    name: "الإكسل: طريقة الدفع",
    run: (t) =>
      swapAll(
        t,
        '[t("payment_method")]: order.payment?.method || "N/A",',
        '[t("payment_method")]: getPaymentMethod(order),'
      ),
  },
  {
    name: "الإكسل: حالة الدفع",
    run: (t) =>
      t.replace(
        /\[t\("payment_status"\)\]: order\.payment\?\.status\s*\? t\(order\.payment\.status\)\s*: "N\/A",/,
        () => '[t("payment_status")]: t(getPaymentStatus(order)),'
      ),
  },
];

const BADGE = `

                      {/* علامة طلبات (اشبك) */}
                      {order.source === "ishbek" && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                          Talabat
                        </span>
                      )}`;

const dispatchPatches = [
  {
    name: "إظهار طلبات اشبك بالطابور",
    run: (t) =>
      swapAll(
        t,
        '(o) => o.source !== "ishbek" && !isExcluded(o)',
        "(o) => !isExcluded(o)"
      ),
  },
  {
    name: "علامة Talabat على صف الطلب",
    run: (t) =>
      t.replace(
        /(#\{order\.sequenceNumber \|\| order\._id\.slice\(-6\)\}\s*<\/span>)/,
        (m) => m + BADGE
      ),
  },
  {
    name: "عنوان طلبات",
    run: (t) =>
      t.replace(
        /const getFullAddress = \(order\) => \{\s*const parts = \[\];/,
        () =>
          "const getFullAddress = (order) => {\n" +
          "    // طلبات اشبك: العنوان محفوظ بتفاصيل الطلب\n" +
          '    if (order.source === "ishbek" && order.userDetails?.apartment) {\n' +
          "      return order.userDetails.apartment;\n" +
          "    }\n" +
          "    const parts = [];"
      ),
  },
];

const files = walk(ROOT);
const adminFile = findFile(files, "function AdminDashboard()");
const dispatchFile = findFile(files, "function DispatchQueue()");

if (!adminFile) console.log("ما لقيت ملف AdminDashboard. تأكد إنك شغّلت الأمر من مجلد المشروع.");
else applyPatches(adminFile, adminPatches, "getPaymentMethod");

if (!dispatchFile) console.log("ما لقيت ملف DispatchQueue. تأكد إنك شغّلت الأمر من مجلد المشروع.");
else applyPatches(dispatchFile, dispatchPatches, "Talabat");

console.log("\nخلصنا. أعد تحميل صفحة الداشبورد بالمتصفح.");