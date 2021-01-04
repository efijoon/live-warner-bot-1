let app = require("express")();
const mongoose = require("mongoose");
const moment = require("moment-jalaali");
const puppeteer = require("puppeteer");
const Namad = require("./Namad");

// ===================== DATA ============================== //

const dataOne = require("./data/data-1.json");
const dataTwo = require("./data/data-2.json");
const dataThree = require("./data/data-3.json");
const dataFour = require("./data/data-4.json");
const dataFive = require("./data/data-5.json");

// ===================== DATA ============================== //

app.get("/", (req, res) => {
  res.send("Part ...");
});

(async () => {
  mongoose.connect(
    "mongodb+srv://user-erfanpoorsina:@Imerfanpoorsina85@cluster0.a7x8h.mongodb.net/liveWarner?retryWrites=true&w=majority",
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  let iteratorOne = 0;
  let iteratorUpOne = true;
  const browserOne = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    waitUntil: "domcontentloaded",
    args: ["--no-sandbox"],
  });

  // let iteratorTwo = 0;
  // let iteratorUpTwo = true;
  // const browserTwo = await puppeteer.launch({
  //   // executablePath: "/usr/bin/chromium-browser",
  //   headless: true,
  //   waitUntil: "domcontentloaded",
  //   args: ["--no-sandbox"],
  // });

  // let iteratorThree = 0;
  // let iteratorUpThree = true;
  // const browserThree = await puppeteer.launch({
  //   // executablePath: "/usr/bin/chromium-browser",
  //   headless: true,
  //   waitUntil: "domcontentloaded",
  //   args: ["--no-sandbox"],
  // });

  // let iteratorFour = 0;
  // let iteratorUpFour = true;
  // const browserFour = await puppeteer.launch({
  //   // executablePath: "/usr/bin/chromium-browser",
  //   headless: true,
  //   waitUntil: "domcontentloaded",
  //   args: ["--no-sandbox"],
  // });

  // let iteratorFive = 0;
  // let iteratorUpFive = true;
  // const browserFive = await puppeteer.launch({
  //   // executablePath: "/usr/bin/chromium-browser",
  //   headless: true,
  //   waitUntil: "domcontentloaded",
  //   args: ["--no-sandbox"],
  // });

  setInterval(async () => {
    console.log(
      iteratorOne
      // iteratorTwo,
      // iteratorThree,
      // iteratorFour,
      // iteratorFive
    );

    let time = moment(Date.now()).format("HHmmss");
    // if (parseInt(time) > 083100 && parseInt(time) < 124530) {
    // iteratorUp is the boolean that shows the getData() is executed completely
    // iterator is the index of each browsers symbol

    if (iteratorUpOne) {
      iteratorUpOne = false;

      getData(browserOne, dataOne, iteratorOne)
        .then((result) => {
          iteratorUpOne = true;
          iteratorOne++;
        })
        .catch((result) => {
          iteratorUpOne = true;
          iteratorOne++;
        });
    }

    // if (iteratorUpTwo) {
    //   iteratorUpTwo = false;

    //   getData(browserTwo, dataTwo, iteratorTwo)
    //     .then((result) => {
    //       iteratorUpTwo = true;
    //       iteratorTwo++;
    //     })
    //     .catch((result) => {
    //       iteratorUpTwo = true;
    //       iteratorTwo++;
    //     });
    // }

    // if (iteratorUpThree) {
    //   iteratorUpThree = false;

    //   getData(browserThree, dataThree, iteratorThree)
    //     .then((result) => {
    //       iteratorUpThree = true;
    //       iteratorThree++;
    //     })
    //     .catch((result) => {
    //       iteratorUpThree = true;
    //       iteratorThree++;
    //     });
    // }

    // if (iteratorUpFour) {
    //   iteratorUpFour = false;

    //   getData(browserFour, dataFour, iteratorFour)
    //     .then((result) => {
    //       iteratorUpFour = true;
    //       iteratorFour++;
    //     })
    //     .catch((result) => {
    //       iteratorUpFour = true;
    //       iteratorFour++;
    //     });
    // }

    // if (iteratorUpFive) {
    //   iteratorUpFive = false;

    //   getData(browserFive, dataFive, iteratorFive)
    //     .then((result) => {
    //       iteratorUpFive = true;
    //       iteratorFive++;
    //     })
    //     .catch((result) => {
    //       iteratorUpFive = true;
    //       iteratorFive++;
    //     });
    // }
    // }
  }, 1000);

  async function getData(browser, data, iterator) {
    const page = await browser.newPage();
    try {
      await page.goto(
        `https://rahavard365.com/asset/${data[iterator].id}/${data[iterator].name}`
      );

      await page
        .evaluate(async () => {
          const dealingPriceContainer = document.getElementById("asset-info");
          const dealingPrice = dealingPriceContainer.querySelector(
            ".bold-price"
          ).innerText;
          const dealingPricePercent = document.querySelector(
            "#asset-info .asset-close span"
          ).innerText;

          const lastPriceContainer = document.querySelectorAll(
            ".symbolprices tr td"
          );
          const lastPrice = lastPriceContainer[1].childNodes[1].innerText;
          const lastPricePercent =
            lastPriceContainer[1].childNodes[5].innerText;

          const infoContainer = document.querySelectorAll(
            ".symbolprices tr td"
          );
          const hajmMoamelat = infoContainer[11].innerText.replace("M", "");
          const arzeshMoamelat = infoContainer[13].innerText.replace("B", "");

          const desc = document.querySelector(".asset-desc").innerText;

          const bidaskTableContainer = document.querySelectorAll(
            ".data-box.info-box"
          )[3];
          let bidaskTable = "";
          if (bidaskTableContainer.querySelector(".bidasks"))
            bidaskTable = bidaskTableContainer.innerHTML;
          else bidaskTable = null;

          return {
            desc,
            dealingPrice,
            dealingPricePercent,
            lastPrice,
            lastPricePercent,
            hajmMoamelat,
            arzeshMoamelat,
            bidaskTable,
          };
        })
        .then(async (result) => {
          const namad = await Namad.findOne({ namadID: data[iterator].id });
          if (namad) {
            await namad.updateOne({
              namadID: data[iterator].id,
              name: data[iterator].name,
              data: result,
            });
          } else {
            const newNamad = new Namad({
              namadID: data[iterator].id,
              name: data[iterator].name,
              data: result,
            });
            await newNamad.save();
          }

          if (iterator == data.length) {
            console.log("Complete ...");
            iterator = 0;
          }

          await page.close();
        })
        .catch(async (err) => {
          console.log(`Null: ${data[iterator].id}`);
          await page.close();
        });
    } catch (e) {
      if (e instanceof puppeteer.errors.TimeoutError) {
        console.log(`Failed: ${data[iterator].id}`);
        await page.close();
      }
    }
  }
})();

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running ...");
});
