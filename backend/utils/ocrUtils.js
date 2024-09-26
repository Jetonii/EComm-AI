const tesseract = require('tesseract.js');

async function performOCR(page) {
    const screenshot = await page.screenshot();
    const { data: { text } } = await tesseract.recognize(screenshot, 'eng');
    return text;
}

module.exports = { performOCR };