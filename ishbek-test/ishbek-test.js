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

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const TOKEN_URL = "https://identity-stg.ishbek.com/connect/token";
const API_BASE = "https://stg.ishbek.com/core-service/api/integration";
const MENU_ID = "01a13a03-39ea-7474-bfc0-157098f97460"; // Test Menu

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log("ناقص CLIENT_ID أو CLIENT_SECRET.");
  process.exit(1);
}

const menu = {
  menuId: MENU_ID,
  overrides: [],
  modifierGroups: [],
  categories: [
    {
      originalId: "cat-sandwiches",
      name: { en: "Sandwiches", ar: "سندويشات" },
      description: { en: "Our sandwiches", ar: "سندويشاتنا" },
      order: 1,
      products: [
        {
          originalId: "prod-chicken-shawarma",
          name: { en: "Chicken Shawarma", ar: "شاورما دجاج" },
          description: { en: "Chicken shawarma sandwich", ar: "ساندويش شاورما دجاج" },
          price: 2.5,
          pricingType: 0,
          order: 1,
          tax: 0,
          sku: "SHW-001",
          preparingTimeInMinutes: 10,
        },
        {
          originalId: "prod-meat-shawarma",
          name: { en: "Meat Shawarma", ar: "شاورما لحمة" },
          description: { en: "Meat shawarma sandwich", ar: "ساندويش شاورما لحمة" },
          price: 3.0,
          pricingType: 0,
          order: 2,
          tax: 0,
          sku: "SHW-002",
          preparingTimeInMinutes: 10,
        },
      ],
    },
  ],
};

async function main() {
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
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(menu),
  });
  const text = await res.text();
  console.log("\nنتيجة إرسال المنيو. الكود:", res.status);
  console.log(text || "(رد فاضي، وهاد غالباً معناه نجح)");
}

main().catch((e) => console.log("خطأ:", e.message));