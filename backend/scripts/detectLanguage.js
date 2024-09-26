async function detectLanguage(page) {
    const language = await page.evaluate(() => navigator.language);
    console.log(`Page language detected: ${language}`);
    return language;
}

module.exports = detectLanguage;

