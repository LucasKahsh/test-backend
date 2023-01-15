import puppeteer from 'puppeteer';
import express from 'express'

const app = express();
app.use(express.json());

app.get('/notbooks', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops');
  
    let response = await page.evaluate(() => {
      let elements = document.querySelectorAll('.thumbnail');
      let notebooks = []
      for(let element of elements){
          let notebook = {}
          notebook.title = element.children[1].children[1].children[0].innerText
          if (!(notebook.title.toLowerCase()).includes('lenovo')){
              continue
          }
          notebook.img_src = element.children[0].attributes[2].value
          notebook.price = element.children[1].children[0].innerHTML
          notebook.description = element.children[1].children[2].innerText
          notebook.review = element.children[2].children[0].innerText
          notebook.url = element.children[1].children[1].children[0].href
          notebooks.push(notebook)
      }
      return notebooks
    })
    
    for(let not of response){
      await page.goto(not.url);
      let noteData = await page.evaluate(async () => {
        let htmlNote = document.querySelectorAll('.caption');
        return htmlNote[0].children[1].innerText
      })
      not.title = noteData
    }

    await browser.close();
    res.send(response).json()
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
