const puppeteer = require("puppeteer");
const fs = require('fs');

(async () => {
  const accountsFilePath = 'fb account.txt';
  const accounts = fs.readFileSync(accountsFilePath, 'utf-8').split('\n');

  const browser = await puppeteer.launch({ headless: false }); // Đặt headless thành true để không hiển thị trình duyệt
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  for (const account of accounts) {
    const userData = parseAccountData(account);
    if (userData) {
      const loginResult = await testLogin(page, userData);
      console.log(`${userData.email}: ${loginResult}`);
    }
  }

  await browser.close();
})();

function parseAccountData(account) {
  const [email, pass] = account.split(':');
  if (email && pass) {
    return { email: email.trim(), pass: pass.trim() };
  }
  return null;
}

async function testLogin(page, userData) {
  await page.goto("https://www.facebook.com/");

  await page.type("#email", userData.email);
  await page.type("#pass", userData.pass);
  await page.click("button[type='submit']");

  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  if (page.url().startsWith("https://www.facebook.com/login")) {
    return "Login failed";
  } else {
    return "Login successful";
  }
}
