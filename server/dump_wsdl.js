const soap = require('soap');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function main() {
  try {
    const client = await soap.createClientAsync('https://zcstgpublic.jo.zain.com:5001/ZCPublicVPNAPI.svc?singleWsdl', { requestTimeout: 5000 });
    const desc = client.describe();
    fs.writeFileSync('wsdl_dump.json', JSON.stringify(desc, null, 2));
    console.log("Wrote WSDL to wsdl_dump.json");
  } catch(e) {
    fs.writeFileSync('wsdl_dump.json', JSON.stringify({error: e.message}));
  }
}
main();
