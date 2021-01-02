let app = require("express")();
const mongoose = require("mongoose");
const moment = require("moment-jalaali");
const puppeteer = require("puppeteer");
const Namad = require("./Namad");

app.get("/", (req, res) => {
  res.send('Part 1')
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

  const browser = await puppeteer.launch({
    headless: true,
    waitUntil: "domcontentloaded",
    args: ["--no-sandbox"],
  });

  let iterator = 0;
  const data = require("./data.json");
  let iteratorUp = true;

  setInterval(async () => {
    let time = moment(Date.now()).format('HHmmss'); 

    if(parseInt(time) > 083100 && parseInt(time) < 124530) {
      if (iteratorUp) {
        const page = await browser.newPage();
        try {
          iteratorUp = false;  
  
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
  
              iterator++;
              iteratorUp = true;

              if (iterator == data.length) {
                console.log('Complete ...');
                iterator = 0; 
              }
  
              await page.close();
            }).catch(async (err) => {
              console.log(`Null: ${data[iterator].id}`);
              iterator++;
              iteratorUp = true;
              await page.close();
            })
        } catch (e) {
          if (e instanceof puppeteer.errors.TimeoutError) {
            console.log(`Failed: ${data[iterator].id}`);
            iterator++;
            iteratorUp = true;
            await page.close();
          }
        }
      }
    }
  }, 1000);

})(); 

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running ...");
});
