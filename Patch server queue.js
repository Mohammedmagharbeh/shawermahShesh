// تعديلات السيرفر لطلبات اشبك (طلبات) بصفحة الإرسال:
//  1) إظهارها بطابور الإرسال (شيل فلتر ishbek من getDeliveryQueue)
//  2) ما نبعت إشعار للزبون لما تنتسلّم من الكاونتر (completePickupOrder)

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", "dist", "build", ".next"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.js$/.test(entry.name)) out.push(full);
  }
  return out;
}

const file = walk(ROOT).find((f) => {
  try {
    return fs.readFileSync(f, "utf8").includes("exports.getDeliveryQueue");
  } catch (e) {
    return false;
  }
});

if (!file) {
  console.log("ما لقيت ملف فيه getDeliveryQueue. تأكد إنك شغّلت الأمر من مجلد المشروع.");
  process.exit(1);
}

const raw = fs.readFileSync(file, "utf8");
const crlf = raw.includes("\r\n");
let text = raw.replace(/\r\n/g, "\n");
let changed = 0;

console.log(path.relative(ROOT, file));

// 1) شيل فلتر ishbek من getDeliveryQueue
{
  const start = text.indexOf("exports.getDeliveryQueue");
  let end = text.indexOf("exports.assignOrderToDriver", start);
  if (end === -1) end = text.length;
  const region = text.slice(start, end);
  let count = 0;
  const newRegion = region.replace(/\n[ \t]*source: \{ \$ne: "ishbek" \},/g, () => {
    count += 1;
    return "";
  });
  if (count > 0) {
    text = text.slice(0, start) + newRegion + text.slice(end);
    console.log("  ✓ إظهار طلبات اشبك بالطابور (شلت " + count + " فلتر)");
    changed += 1;
  } else {
    console.log("  - فلتر الطابور: ما لقيت شي (يمكن معدّل من قبل)");
  }
}

// 2) ما نبعت إشعار عند تسليم طلب اشبك من الكاونتر
{
  const start = text.indexOf("exports.completePickupOrder");
  if (start === -1) {
    console.log("  ✗ ما لقيت completePickupOrder");
  } else {
    let end = text.indexOf("exports.getMyDriverStatus", start);
    if (end === -1) end = text.length;
    const region = text.slice(start, end);
    if (region.includes('source !== "ishbek") sendToUser(')) {
      console.log("  - الإشعار: معدّل من قبل");
    } else if (!region.includes("sendToUser(")) {
      console.log("  ✗ ما لقيت sendToUser بدالة completePickupOrder");
    } else {
      const newRegion = region.replace(
        "sendToUser(",
        'if (order.source !== "ishbek") sendToUser('
      );
      text = text.slice(0, start) + newRegion + text.slice(end);
      console.log("  ✓ إيقاف إشعار الزبون لطلبات اشبك عند التسليم");
      changed += 1;
    }
  }
}

if (changed === 0) {
  console.log("\nما تغيّر شي.");
  process.exit(0);
}

fs.writeFileSync(file + ".bak", raw, "utf8");
fs.writeFileSync(file, crlf ? text.replace(/\n/g, "\r\n") : text, "utf8");
console.log("\nتم الحفظ، والنسخة الاحتياطية: " + path.basename(file) + ".bak");
console.log("أعد تشغيل السيرفر (Ctrl+C ثم npm run dev) إذا ما أعاد تشغيل حاله.");