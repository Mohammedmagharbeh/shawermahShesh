// // تست ربط اشبك (staging) - النسخة 3: بتطبع تفاصيل كل محاولة
// // الاستعمال (PowerShell):
// //   $env:CLIENT_ID="..."; $env:CLIENT_SECRET="..."; node ishbek-test.js
// // لازم Node 18 أو أحدث.

// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;

// const TOKEN_URLS = [
//   "https://identity-stg.ishbek.com/connect/token",
//   "https://identity-stg.ishbek.com/api/connect/token",
//   "https://stg.ishbek.com/identity-service/connect/token",
//   "https://stg.ishbek.com/identity-service/api/connect/token",
// ];
// const API_BASE = "https://stg.ishbek.com/core-service/api/integration";

// if (!CLIENT_ID || !CLIENT_SECRET) {
//   console.log("ناقص CLIENT_ID أو CLIENT_SECRET.");
//   process.exit(1);
// }

// async function getToken() {
//   for (const url of TOKEN_URLS) {
//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         redirect: "manual", // ما نتبع التحويل، بس نشوف وين بيروح
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({
//           grant_type: "client_credentials",
//           client_id: CLIENT_ID,
//           client_secret: CLIENT_SECRET,
//           scope: "integration-api core-api",
//         }),
//       });
//       const text = await res.text();
//       console.log(`\nجربت ${url}`);
//       console.log(`  الكود: ${res.status}`);
//       console.log(`  location: ${res.headers.get("location") || "-"}`);
//       console.log(`  content-type: ${res.headers.get("content-type") || "-"}`);
//       console.log(`  allow: ${res.headers.get("allow") || "-"}`);
//       console.log(`  server: ${res.headers.get("server") || "-"}`);
//       console.log(`  الرد: ${text.slice(0, 300) || "(فاضي)"}`);
//       if (res.ok) {
//         console.log("✅ المصادقة شغالة على هالرابط.");
//         return JSON.parse(text).access_token;
//       }
//     } catch (e) {
//       console.log(`\nجربت ${url}\n  خطأ: ${e.cause?.code || e.message}`);
//     }
//   }
//   return null;
// }

// async function main() {
//   const token = await getToken();
//   if (!token) {
//     console.log("\n❌ ما نجح أي رابط. ابعت الطباعة اللي فوق كلها.");
//     return;
//   }

//   const headers = { Authorization: `Bearer ${token}` };

//   const branchesRes = await fetch(`${API_BASE}/Branches`, { headers });
//   console.log("\n--- الفروع (الكود", branchesRes.status + ") ---");
//   console.log((await branchesRes.text()).slice(0, 2000));

//   const menusRes = await fetch(`${API_BASE}/Menus`, { headers });
//   console.log("\n--- المنيوهات (الكود", menusRes.status + ") ---");
//   console.log((await menusRes.text()).slice(0, 2000));
// }

// main().catch((e) => console.log("خطأ:", e.message));

// بعت منيو تجريبية صغيرة لاشبك (staging)
// الاستعمال (PowerShell):
//   $env:CLIENT_ID="..."; $env:CLIENT_SECRET="..."; node ishbek-push-menu.js
// لازم Node 18 أو أحدث.
// تنبيه: أي صنف مش موجود بالطلب بينحذف من المنيو (هاد بتصرف اشبك).

// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;

// const TOKEN_URL = "https://identity-stg.ishbek.com/connect/token";
// const API_BASE = "https://stg.ishbek.com/core-service/api/integration";
// const MENU_ID = "01a13a03-39ea-7474-bfc0-157098f97460"; // Test Menu

// if (!CLIENT_ID || !CLIENT_SECRET) {
//   console.log("ناقص CLIENT_ID أو CLIENT_SECRET.");
//   process.exit(1);
// }

// const menu = {
//   menuId: MENU_ID,
//   overrides: [],
//   modifierGroups: [],
//   categories: [
//     {
//       originalId: "cat-sandwiches",
//       name: { en: "Sandwiches", ar: "سندويشات" },
//       description: { en: "Our sandwiches", ar: "سندويشاتنا" },
//       order: 1,
//       products: [
//         {
//           originalId: "prod-chicken-shawarma",
//           name: { en: "Chicken Shawarma", ar: "شاورما دجاج" },
//           description: { en: "Chicken shawarma sandwich", ar: "ساندويش شاورما دجاج" },
//           price: 2.5,
//           pricingType: 0,
//           order: 1,
//           tax: 0,
//           sku: "SHW-001",
//           preparingTimeInMinutes: 10,
//         },
//         {
//           originalId: "prod-meat-shawarma",
//           name: { en: "Meat Shawarma", ar: "شاورما لحمة" },
//           description: { en: "Meat shawarma sandwich", ar: "ساندويش شاورما لحمة" },
//           price: 3.0,
//           pricingType: 0,
//           order: 2,
//           tax: 0,
//           sku: "SHW-002",
//           preparingTimeInMinutes: 10,
//         },
//       ],
//     },
//   ],
// };

// async function main() {
//   const tokenRes = await fetch(TOKEN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       scope: "integration-api core-api",
//     }),
//   });
//   if (!tokenRes.ok) {
//     console.log("❌ فشل جلب التوكن:", tokenRes.status, await tokenRes.text());
//     return;
//   }
//   const token = (await tokenRes.json()).access_token;
//   console.log("✅ المصادقة شغالة.");

//   const res = await fetch(`${API_BASE}/Menus/${MENU_ID}`, {
//     method: "PUT",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(menu),
//   });
//   const text = await res.text();
//   console.log("\nنتيجة إرسال المنيو. الكود:", res.status);
//   console.log(text || "(رد فاضي، وهاد غالباً معناه نجح)");
// }

// main().catch((e) => console.log("خطأ:", e.message));


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

// الإعدادات بتنقرأ من .env (بدل ما تكون مكتوبة بالكود) عشان نقدر نبدّل بين التجربة والإنتاج
//   ISHBEK_TOKEN_URL  رابط التوكن
//   ISHBEK_API_BASE   رابط الـ API (ينتهي بـ /api/integration)
//   ISHBEK_MENU_ID    رقم المنيو اللي بدك ترفع عليه
const TOKEN_URL = process.env.ISHBEK_TOKEN_URL;
const API_BASE = process.env.ISHBEK_API_BASE;
const MENU_ID = process.env.ISHBEK_MENU_ID;
const SCOPE = process.env.ISHBEK_SCOPE || "integration-api core-api";
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
  // نقبل أسماء ISHBEK_* أو الأسماء القديمة CLIENT_ID / CLIENT_SECRET
  const CLIENT_ID = process.env.ISHBEK_CLIENT_ID || process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.ISHBEK_CLIENT_SECRET || process.env.CLIENT_SECRET;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log("❌ ناقص ISHBEK_CLIENT_ID أو ISHBEK_CLIENT_SECRET بملف .env");
    return;
  }

  // تأكيد قبل الإرسال، عشان ما ترفع على البيئة الغلط. الـ PUT بيستبدل المنيو كامل.
  console.log("\n⚠️  الهدف:");
  console.log("   API   :", API_BASE);
  console.log("   Menu  :", MENU_ID);
  console.log("   عدد الأصناف:", menu.categories.reduce((n, c) => n + c.products.length, 0));
  console.log("   عندك 5 ثواني، اضغط Ctrl+C إذا مش هاد المطلوب...");
  await new Promise((r) => setTimeout(r, 5000));

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SCOPE,
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
  if (PUSH && (!TOKEN_URL || !API_BASE || !MENU_ID)) {
    console.log("❌ ناقص واحد من هدول بملف .env: ISHBEK_TOKEN_URL و ISHBEK_API_BASE و ISHBEK_MENU_ID");
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