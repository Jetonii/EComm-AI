const puppeteer = require('puppeteer');

async function navigateToPage(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    return { browser, page };
}

module.exports = { navigateToPage };

// Usage example:
// const { navigateToPage } = require('./navigateAndCollect');
// navigateToPage('https://www.gerryweber.com/de-de/');
