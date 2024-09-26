// const { navigateToPage } = require('./navigateAndCollect.js');
// const { detectLanguage } = require('./detectLanguage');
const { gatherConsoleInfo } = require('./gatherConsoleInfo');
const { performOCR } = require('../utils/ocrUtils');
const { summarize } = require('../utils/summarize');
const { saveToCSV } = require('../utils/csvUtils');

const puppeteer = require('puppeteer');

// const { generateXpaths } = require('./gatherPageInfo');

(async () => {
    const { browser, page } = await navigateToPage('https://www.gerryweber.com/en-eu/');
    const language = await detectLanguage(page);
    const consoleInfo = await gatherConsoleInfo(page);
    const ocrText = await performOCR(page);
    const aiSummary = await summarize(ocrText);
    // const xpaths = await generateXpaths(page);

    const dataToSave = [
        { language, consoleErrors: JSON.stringify(consoleInfo), ocrText, aiSummary }
    ];

    await saveToCSV(dataToSave, 'output.csv');
    await browser.close();
})();


async function navigateToPage(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  return { browser, page };
}


async function detectLanguage(page) {
    const franc = await import('franc');  

    // 1. Check the <html lang> attribute
    let language = await page.evaluate(() => {
        return document.documentElement.lang || navigator.language;
    });

    if (language) {
        console.log(`Language detected from <html lang> or navigator: ${language}`);
        return language;
    }

    // 2. Fallback to content-based detection using franc
    const bodyText = await page.evaluate(() => document.body.innerText);
    const detectedLanguage = franc(bodyText);

    if (detectedLanguage !== 'und') {
        console.log(`Language detected from page content: ${detectedLanguage}`);
        return detectedLanguage;
    }

    // 3. Fallback to navigator.language if everything else fails
    language = await page.evaluate(() => navigator.language);
    console.log(`Language detected from navigator as a last resort: ${language}`);
    return language;
}

module.exports = navigateToPage;
