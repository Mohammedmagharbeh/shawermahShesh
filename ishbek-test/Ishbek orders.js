// بيسحب طلبات اليوم لفرع Test Branch من API اشبك (staging)
// الاستعمال (PowerShell):
//   $env:CLIENT_ID="..."; $env:CLIENT_SECRET="..."; node ishbek-orders.js
// لتاريخ ثاني: node ishbek-orders.js 2026-10-14
// لازم Node 18 أو أحدث.

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const TOKEN_URL = "https://identity-stg.ishbek.com/connect/token";
const API_BASE = "https://stg.ishbek.com/core-service/api/integration";
const BRANCH_ID = "01a13a01-574d-76aa-86aa-af586f6692ce"; // Test Branch

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log("ناقص CLIENT_ID أو CLIENT_SECRET.");
  process.exit(1);
}

const date = process.argv[2] || new Date().toLocaleDateString("en-CA"); // yyyy-MM-dd

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
  const headers = { Authorization: `Bearer ${token}` };
  console.log("✅ المصادقة شغالة.");

  const url = `${API_BASE}/Orders?branchId=${BRANCH_ID}&date=${date}`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log(`\n--- طلبات ${date} (الكود ${res.status}) ---`);
  console.log(text.slice(0, 4000) || "(رد فاضي)");

  // إذا في طلبات، نجيب تفاصيل أول طلب
  let first;
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data.items || data.orders || data.data || [];
    first = list[0];
  } catch (e) {}

  if (first && first.id) {
    const d = await fetch(`${API_BASE}/Orders/${first.id}`, { headers });
    console.log(`\n--- تفاصيل أول طلب (الكود ${d.status}) ---`);
    console.log((await d.text()).slice(0, 4000));
  }
}

main().catch((e) => console.log("خطأ:", e.message));