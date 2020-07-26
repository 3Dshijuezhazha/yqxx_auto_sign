const puppeteer = require("puppeteer");
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const process = require('process');
is_same_day = function (t) {
  return new Date(t).toDateString() === new Date().toDateString();
};

const passwords = [
  {
    u: process.env.JWC_USERNAME,
    p: process.env.JWC_PASSWORD,
    lat: process.env.SIM_LAT,
    long: process.env.SIM_LONG,
    sa: process.env.WECHAT_ROBOT_HOOK
  }
];


(async () => {
  for (let a of passwords) {
    const datestring = new Date().toLocaleDateString("zh-CN");
    // const read = fs.readFileSync("date.txt", "utf-8");
    // if (read === datestring) {
    //   console.debug('signed.');
    //   return;
    // };
    let platformExecutablePath = "";
    let args = [];
    switch(os.platform()){
      case "windows":
        platformExecutablePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
        break;
      case "darwin":
        platformExecutablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        break;
      case "linux":
        platformExecutablePath = "google-chrome-stable"
        args.push("--no-sandbox")
        break
    }
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: platformExecutablePath,
      args: args
    });
    const page = await browser.newPage();
    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    await page.type("#username", a.u, { delay: 105 })
    await page.type("#password", a.p, { delay: 105 })
    await page.click('#casLoginForm > p:nth-child(5) > button')
    await page.waitFor(5000)

    await page.goto('http://xg.hit.edu.cn/zhxy-xgzs/xg_mobile/xs/yqxx');
    await page.waitFor(10000);
    const latest_upload = await page.evaluate(() => {
      return document.getElementsByClassName("content_title")[1].innerText.split("：")[1];
    });
    if (is_same_day(latest_upload)) {
      await browser.close();
      console.log("Signed.")
    }
    else {
      // await page.screenshot({ path: 'tofill.png' })
      // await page.evaluateOnNewDocument(function() {
      //   navigator.geolocation.getCurrentPosition = function (cb) {
      //     setTimeout(() => {
      //       cb({
      //         'coords': {
      //           accuracy: 21,
      //           altitude: null,
      //           altitudeAccuracy: null,
      //           heading: null,
      //           latitude: a.lat+parseFloat(Number(Math.random()*0.00006).toFixed(6)),
      //           longitude: a.long+parseFloat(Number(Math.random()*0.00006).toFixed(6)),
      //           speed: null
      //         }
      //       })
      //     }, Math.round(Math.random()*500+500))
      //   }
      // });
      await page.click('body > div.content > div.content_nr > div:nth-child(1) > a > div')
      await page.waitForNavigation();
      await page.evaluate(() => { document.getElementById("txfscheckbox").checked = true });
      await page.click('body > div.right_btn');
      await page.waitForNavigation();
      console.log("New Signed.");
      await browser.close();
    }
    if (a.sa) {
      r = await fetch(a.sa, {
        body: JSON.stringify({
          "msgtype": "text",
          "text": {
            "content": `${datestring}签到已经完成.`
          }
        }), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'user-agent': 'Mozilla/5.0 nodejs Server',
          'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
      })
      rcode = await r.json()
      console.log(rcode);
    }
    // fs.writeFileSync("date.txt", datestring, "utf-8");
  }
})();



