export async function detectLanguage(page) {
    const franc = await import('franc');

    // 1. Check the <html lang> attribute
    let language = await page.evaluate(() => {
        return document.documentElement.lang;
    });

    if (language) {
        console.log(`Language detected from <html lang>: ${language}`);
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