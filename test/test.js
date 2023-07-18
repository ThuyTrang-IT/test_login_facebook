const puppeteer = require("puppeteer");

(async () => {
  const userData = {
    uid: "100093953724492",
    pass: "Nert67cfQK5",
    fa: "4CM2AFEEAHZQNWSFVD2CC4Q5KQBMI3VG",
    cookie:
      "sb=Y6eiZGBmWiFjFr_8AZU1-_ak;fr=02mMkxU3ahamN6GGt.AWXhqEb0sNj1PP1HPcg5Ga1F2R8.BkomGp..AAA.0.0.BkomGp.AWU;datr=qWGiZNfWuwd5ZteLTHZoctWT;xs=19:7stD9ffNfWLk6g:2:1688363433:;c_user=100093953724492;m_page_voice=100093953724492;wd=200x200;m_pixel_ratio=1;",
    email: "rachkidjatiew@hotmail.com",
    passmail: "V6WL68Rb46",
  };

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Set cookies for the user
  /* const cookies = userData.cookie.split(";").map((pair) => {
    const [name, value] = pair.trim().split("=");
    return { name, value, domain: ".facebook.com" };
  });
  await page.setCookie(...cookies); */

  // Navigate to Facebook login page
  await page.goto("https://www.facebook.com/");

  // Fill in login form
  await page.type("#email", userData.email);
  await page.type("#pass", userData.pass);

  // Submit login form
  await page.click("button[type='submit']");

  // Wait for navigation to complete
  await page.waitForNavigation();

  // Check if 2FA is required
  if (await page.$("#approvals_code")) {
    // Fill in 2FA code
    await page.type("#approvals_code", userData.fa);
    await page.click("#checkpointSubmitButton");

    // Wait for navigation to complete
    await page.waitForNavigation();
  }

  // Check if login was successful
  if (page.url().startsWith("https://www.facebook.com/")) {
    console.log("Login failed");
  } else {
    console.log("Login successful");
  }

  // Close the browser
  await browser.close();
})();
