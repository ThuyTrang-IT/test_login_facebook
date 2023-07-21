const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");

(async () => {
  // Đọc nội dung của file "fb account.txt"
  const fileContent = fs.readFileSync("fb account.txt", "utf-8");
  const accounts = fileContent.split("\n");

  // Tạo một mảng promises đại diện cho việc đăng nhập từng tài khoản
  const loginPromises = accounts.map(async (account) => {
    const [uid, pass, fa, cookie, email, passmail] = account.split("|").map((item) => item.trim());

    const browser = await puppeteer.launch({ headless: false }); // Sử dụng headless để trình duyệt chạy ẩn danh
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to Facebook login page
    await page.goto("https://www.facebook.com/");

    // Fill in login form
    await page.type("#email", email || uid);
    await page.type("#pass", pass);

    // Submit login form
    await page.click("button[type='submit']");

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Check if 2FA is required
    if (await page.$("#approvals_code")) {
      // Fill in 2FA code
      const response = await axios.get(`https://2fa.live/tok/${fa}`);
      const token = response.data;
      await page.type("#approvals_code", token.token);
      await page.click("#checkpointSubmitButton");

      // Wait for navigation to complete
      await page.waitForNavigation();
    }

    // Check if login was successful
    if (page.url().startsWith("https://www.facebook.com/")) {
      console.log(`Login successful for account with UID: ${uid}`);
    } else {
      console.log(`Login failed for account with UID: ${uid}`);
    }

    // Clear cookies and close the browser for this account
    await page.deleteCookie();
    await browser.close();
  });

  try {
    // Chờ đợi tất cả các tài khoản đăng nhập xong
    await Promise.all(loginPromises);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi đăng nhập:", error);
  }
})();



