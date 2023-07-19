const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  // Đọc nội dung của file "fb account.txt"
  const fileContent = fs.readFileSync("fb account.txt", "utf-8");
  const accounts = fileContent.split("\n");

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  for (const account of accounts) {
    const [uid, pass, fa, cookie, email, passmail] = account
      .split("|")
      .map((item) => item.trim());

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
      if (!fa) {
        console.log(`2FA code is required for account with UID: ${uid}`);
        continue;
      }

      // Fill in 2FA code
      await page.type("#approvals_code", fa);
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

    // Clear cookies for the next login attempt
    await page.deleteCookie();

    // Wait a short time before logging in with the next account
    await page.waitForTimeout(2000);
  }

  // Close the browser
  await browser.close();
})();
