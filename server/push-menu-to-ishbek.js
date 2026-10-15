// بيحوّل منيو ShawermaSheesh من الداتابيس لصيغة اشبك، وبيبعتها (staging)
// مكانه: جوا مجلد server (جنب print-product.js)
//
// الخطوة 1 (تجربة بدون إرسال، بيكتب ملف ishbek-menu.json وبيطبع ملخص):
//   node push-menu-to-ishbek.js
//
// الخطوة 2 (إرسال فعلي لاشبك، PowerShell):
//   $env:CLIENT_ID="..."; $env:CLIENT_SECRET="..."; node push-menu-to-ishbek.js --push
//
// تنبيه: الإرسال بيحذف من Test Menu أي صنف مش موجود بالمنيو الجديدة (منيو التجربة بتنحذف).

require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");

const PUSH = process.argv.includes("--push");

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DB_URL ||
  process.env.DATABASE_URL ||
  process.env.DB_URI;

const TOKEN_URL = "https://identity-stg.ishbek.com/connect/token";
const API_BASE = "https://stg.ishbek.com/core-service/api/integration";
const MENU_ID = "01a13a03-39ea-7474-bfc0-157098f97460"; // Test Menu
const PREP_TIME_MINUTES = 15; // وقت التحضير، عدّله إذا بدك

const CHOICE_NAMES = {
  sandwich: { en: "Sandwich", ar: "ساندويش" },
  meal: { en: "Meal", ar: "وجبة" },
  chicken: { en: "Chicken", ar: "دجاج" },
  meat: { en: "Meat", ar: "لحمة" },
};

const clean = (s) => (s || "").toString().trim();
const loc = (o) => ({ en: clean(o && o.en), ar: clean(o && o.ar) });
const money = (n) => Math.round(Number(n) * 100) / 100;

function buildMenu(categories, products) {
  const warnings = [];
  const modifierGroups = [];
  const stats = { categories: 0, products: 0, groups: 0, options: 0, discounted: 0, outOfStock: 0 };

  function addGroup({ id, name, min, max, order, options }) {
    modifierGroups.push({
      originalId: id,
      name,
      minSelection: min,
      maxSelection: max,
      order,
      options: options.map((o, i) => ({
        originalId: o.id,
        name: o.name,
        minCount: 0,
        maxCount: 1,
        order: i + 1,
        additionalPrice: o.price,
      })),
    });
    stats.groups += 1;
    stats.options += options.length;
    return {
      originalId: id,
      minSelection: min,
      maxSelection: max,
      order,
      modifierOptions: options.map((o) => ({
        originalId: o.id,
        additionalPrice: o.price,
        minCount: 0,
        maxCount: 1,
        isHidden: false,
      })),
    };
  }

  const catDtos = [];

  for (const cat of categories) {
    const items = products
      .filter((p) => String(p.category) === String(cat._id))
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    if (!items.length) {
      warnings.push(`تصنيف بدون أصناف (تخطيته): ${clean(cat.name && cat.name.en)}`);
      continue;
    }

    const productDtos = items.map((p) => {
      const pid = String(p._id);
      const pname = clean(p.name && p.name.en);
      const groups = [];
      let order = 1;

      if (p.discount > 0) stats.discounted += 1;
      if (p.inStock === false) stats.outOfStock += 1;

      let basePrice = money(p.basePrice);

      // خيارات السعر: ساندويش/وجبة أو دجاج/لحمة
      const prices = p.prices && typeof p.prices === "object" ? p.prices : {};
      const entries = Object.entries(prices).filter(([, v]) => typeof v === "number");

      if (p.hasTypeChoices || p.hasProteinChoices) {
        if (p.hasTypeChoices && p.hasProteinChoices) {
          warnings.push(`${pname}: فيه خيارين مع بعض (نوع وبروتين)، التحويل ممكن يكون ناقص`);
        }
        if (!entries.length) {
          warnings.push(`${pname}: فيه خيارات بس حقل prices فاضي، استعملت basePrice`);
        } else {
          basePrice = money(Math.min(...entries.map(([, v]) => v)));
          const groupName = p.hasTypeChoices
            ? { en: "Type", ar: "النوع" }
            : { en: "Protein", ar: "البروتين" };
          groups.push(
            addGroup({
              id: `${pid}_choice`,
              name: groupName,
              min: 1,
              max: 1,
              order: order++,
              options: entries.map(([key, v]) => ({
                id: `${pid}_choice_${key}`,
                name: CHOICE_NAMES[key] || { en: key, ar: key },
                price: money(v - basePrice),
              })),
            })
          );
        }
      }

      // الإضافات
      if (p.additions && p.additions.length) {
        const radio = p.additionsSelectionType === "radio";
        groups.push(
          addGroup({
            id: `${pid}_additions`,
            name: { en: "Additions", ar: "الإضافات" },
            min: 0,
            max: radio ? 1 : p.additions.length,
            order: order++,
            options: p.additions.map((a) => ({
              id: String(a._id),
              name: loc(a.name),
              price: money(a.price),
            })),
          })
        );
      }

      // مجموعات إضافات إضافية
      (p.additionCategories || []).forEach((ac, i) => {
        if (!ac.items || !ac.items.length) return;
        const radio = ac.selectionType === "radio";
        groups.push(
          addGroup({
            id: `${pid}_addcat_${i}`,
            name: loc(ac.name),
            min: 0,
            max: radio ? 1 : ac.items.length,
            order: order++,
            options: ac.items.map((it) => ({
              id: String(it._id),
              name: loc(it.name),
              price: money(it.price),
            })),
          })
        );
      });

      stats.products += 1;
      return {
        originalId: pid,
        ...(p.image ? { imageUrl: p.image } : {}),
        name: loc(p.name),
        description: loc(p.description),
        price: basePrice,
        pricingType: 0,
        order: p.position || 0,
        tax: 0,
        sku: pid,
        preparingTimeInMinutes: PREP_TIME_MINUTES,
        modifierGroups: groups,
      };
    });

    stats.categories += 1;
    catDtos.push({
      originalId: String(cat._id),
      name: loc(cat.name),
      description: { en: "", ar: "" },
      order: cat.position || 0,
      products: productDtos,
    });
  }

  return {
    menu: { menuId: MENU_ID, overrides: [], categories: catDtos, modifierGroups },
    stats,
    warnings,
  };
}

async function pushToIshbek(menu) {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log("❌ ناقص CLIENT_ID أو CLIENT_SECRET (اقرأ التعليمات بأول الملف).");
    return;
  }
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "integration-api core-api",
    }),
  });
  if (!tokenRes.ok) {
    console.log("❌ فشل جلب التوكن:", tokenRes.status, await tokenRes.text());
    return;
  }
  const token = (await tokenRes.json()).access_token;
  console.log("✅ المصادقة شغالة.");

  const res = await fetch(`${API_BASE}/Menus/${MENU_ID}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(menu),
  });
  const text = await res.text();
  console.log("\nنتيجة إرسال المنيو. الكود:", res.status);
  console.log(text ? text.slice(0, 3000) : "(رد فاضي، وهاد غالباً معناه نجح)");
}

async function main() {
  if (!uri) {
    console.log("ما لقيت رابط الداتابيس بملف .env.");
    process.exit(1);
  }
  const Product = require("./src/models/products");
  const Category = require("./src/models/Category");

  await mongoose.connect(uri);
  const categories = await Category.find().sort({ position: 1 }).lean();
  const products = await Product.find().lean();
  await mongoose.disconnect();

  const { menu, stats, warnings } = buildMenu(categories, products);

  fs.writeFileSync("ishbek-menu.json", JSON.stringify(menu, null, 2), "utf8");

  console.log("\n--- ملخص ---");
  console.log("تصنيفات:", stats.categories);
  console.log("أصناف:", stats.products);
  console.log("مجموعات خيارات وإضافات:", stats.groups);
  console.log("خيارات داخلها:", stats.options);
  console.log("أصناف عليها خصم (الخصم ما انبعت):", stats.discounted);
  console.log("أصناف مش متوفرة inStock=false (انبعتت كأنها متوفرة):", stats.outOfStock);
  if (warnings.length) {
    console.log("\n--- تحذيرات ---");
    warnings.forEach((w) => console.log("-", w));
  }
  console.log("\nانكتب الملف ishbek-menu.json بمجلد server.");

  if (PUSH) {
    console.log("\nببعت المنيو لاشبك...");
    await pushToIshbek(menu);
  } else {
    console.log("\n(تجربة فقط، ما انبعت شي. للإرسال أضف --push)");
  }
}

main().catch((e) => {
  console.log("خطأ:", e.message);
  process.exit(1);
});