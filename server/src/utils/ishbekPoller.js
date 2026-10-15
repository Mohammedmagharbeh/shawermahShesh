// const fs = require("fs");
// const path = require("path");
// const { saveIshbekOrder } = require("./saveIshbekOrder");
// const CLIENT_ID = process.env.ISHBEK_CLIENT_ID;
// const CLIENT_SECRET = process.env.ISHBEK_CLIENT_SECRET;
// const TOKEN_URL = process.env.ISHBEK_TOKEN_URL || "https://identity-stg.ishbek.com/connect/token";
// const API_BASE = process.env.ISHBEK_API_BASE || "https://stg.ishbek.com/core-service/api/integration";
// const BRANCH_ID = process.env.ISHBEK_BRANCH_ID;
// const POLL_MS = 15000; // كل 15 ثانية

// // للتجربة: إذا ISHBEK_PROCESS_EXISTING=1 بنعالج الطلبات الموجودة أصلاً كأنها جديدة
// const PROCESS_EXISTING = process.env.ISHBEK_PROCESS_EXISTING === "1";
// const SAMPLE_FILE = path.join(process.cwd(), "ishbek-sample-order.json");

// let cached = { token: null, exp: 0 };
// let running = false;
// let firstRun = !PROCESS_EXISTING;
// const seen = new Set();

// // async function getToken() {
// //   if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
// //   const res = await fetch(TOKEN_URL, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //     body: new URLSearchParams({
// //       grant_type: "client_credentials",
// //       client_id: CLIENT_ID,
// //       client_secret: CLIENT_SECRET,
// //       scope: "integration-api core-api",
// //     }),
// //   });
// //   if (!res.ok) throw new Error(`token failed ${res.status}`);
// //   const data = await res.json();
// //   cached = {
// //     token: data.access_token,
// //     exp: Date.now() + (data.expires_in || 3600) * 1000,
// //   };
// //   return cached.token;
// // }
// async function getToken() {
//   if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
//   const res = await fetch(TOKEN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       scope: "integration-api core-api",
//     }),
//   });
//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(`token failed ${res.status}: ${body}`);
//   }
//   const data = await res.json();
//   cached = {
//     token: data.access_token,
//     exp: Date.now() + (data.expires_in || 3600) * 1000,
//   };
//   return cached.token;
// }

// async function api(path) {
//   const token = await getToken();
//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error(`${path} -> ${res.status}`);
//   return res.json();
// }

// function extractList(data) {
//   if (Array.isArray(data)) return data;
//   return data.items || data.orders || data.data || [];
// }

// async function pollOnce(io) {
//   const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Amman" });
//   const list = extractList(await api(`/Orders?branchId=${BRANCH_ID}&date=${date}`));

//   for (const o of list) {
//     if (!o?.id || seen.has(o.id)) continue;

//     // أول مرة: نعتبر الطلبات الموجودة قديمة، ما بنعالجها
//     if (firstRun) {
//       seen.add(o.id);
//       continue;
//     }

//     const full = await api(`/Orders/${o.id}`);
//     seen.add(o.id); // بعد النجاح، عشان إذا فشل الطلب نعيد المحاولة

//     console.log("[ishbek] NEW ORDER:", JSON.stringify(full));
//     try {
//       fs.writeFileSync(
//         SAMPLE_FILE,
//         JSON.stringify({ listItem: o, full }, null, 2),
//         "utf8"
//       );
//       console.log("[ishbek] sample saved to", SAMPLE_FILE);
//     } catch (e) {
//       console.error("[ishbek] could not save sample:", e.message);
//     }

//     // المرحلة 3: هون بنحوّل الطلب ونحفظه ونرن الداشبورد (بعد ما أشوف الشكل)
//     // const order = await saveIshbekOrder(full);
//     // if (io) io.emit("newOrder", order);
//   }
//   firstRun = false;
// }

// function startIshbekPoller(io) {
//       console.log("[ishbek] id:", CLIENT_ID?.slice(0, 20), "secretLen:", CLIENT_SECRET?.length);

//   if (!CLIENT_ID || !CLIENT_SECRET || !BRANCH_ID) {
//     console.log("[ishbek] poller disabled: missing ISHBEK_* env vars");
//     return;
//   }
//   console.log("[ishbek] poller started");
//   setInterval(async () => {
//     if (running) return;
//     running = true;
//     try {
//       await pollOnce(io);
//     } catch (e) {
//       console.error("[ishbek] poll error:", e.message);
//     } finally {
//       running = false;
//     }
//   }, POLL_MS);
// }

// module.exports = { startIshbekPoller };

const { saveIshbekOrder } = require("./saveIshbekOrder");

const CLIENT_ID = process.env.ISHBEK_CLIENT_ID;
const CLIENT_SECRET = process.env.ISHBEK_CLIENT_SECRET;
const TOKEN_URL = process.env.ISHBEK_TOKEN_URL || "https://identity-stg.ishbek.com/connect/token";
const API_BASE = process.env.ISHBEK_API_BASE || "https://stg.ishbek.com/core-service/api/integration";
const BRANCH_ID = process.env.ISHBEK_BRANCH_ID;
const POLL_MS = 15000; // كل 15 ثانية

// للتجربة: إذا ISHBEK_PROCESS_EXISTING=1 بنعالج الطلبات الموجودة أصلاً كأنها جديدة
const PROCESS_EXISTING = process.env.ISHBEK_PROCESS_EXISTING === "1";

let cached = { token: null, exp: 0 };
let running = false;
let firstRun = !PROCESS_EXISTING;
const seen = new Set();

async function getToken() {
  if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "integration-api core-api",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`token failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  cached = {
    token: data.access_token,
    exp: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return cached.token;
}

async function api(path) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  return data.items || data.orders || data.data || [];
}

async function pollOnce(io) {
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Amman" });
  const list = extractList(await api(`/Orders?branchId=${BRANCH_ID}&date=${date}`));

  for (const o of list) {
    if (!o?.id || seen.has(o.id)) continue;

    // أول مرة: نعتبر الطلبات الموجودة قديمة، ما بنعالجها
    if (firstRun) {
      seen.add(o.id);
      continue;
    }

    try {
      const full = await api(`/Orders/${o.id}`);
      const order = await saveIshbekOrder(full);
      seen.add(o.id); // بعد النجاح فقط، عشان إذا فشل نعيد المحاولة
      if (order && io) io.emit("newOrder", order);
      console.log("[ishbek] saved order", full.id);
    } catch (e) {
      console.error("[ishbek] save failed:", e.message);
    }
  }
  firstRun = false;
}

function startIshbekPoller(io) {
  if (!CLIENT_ID || !CLIENT_SECRET || !BRANCH_ID) {
    console.log("[ishbek] poller disabled: missing ISHBEK_* env vars");
    return;
  }
  console.log("[ishbek] poller started");
  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await pollOnce(io);
    } catch (e) {
      console.error("[ishbek] poll error:", e.message);
    } finally {
      running = false;
    }
  }, POLL_MS);
}

module.exports = { startIshbekPoller };