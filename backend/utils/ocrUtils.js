import Tesseract from 'tesseract.js';

export async function tryFindProductListXPathUsingOCR(page, language) {
    try {
        const screenshotPath = './screenshots/screenshot.png';
        await page.screenshot({ path: screenshotPath });

        const languageCode = getTesseractLanguageCode(language);
        const { data: { text } } = await Tesseract.recognize(screenshotPath, languageCode);

        if (text.length > 500) {
            text = text.slice(0, 500);
        }

        const keywords = extractKeywords(text);
        const productListXPath = await findXPathUsingKeywords(page, keywords);

        return productListXPath;
    } catch (error) {
        console.error("Error during OCR:", error);
        throw error;
    }
}

function extractKeywords(text) {
    const noiseWords = ['the', 'is', 'at', 'which', 'on', 'and', 'to', 'a', 'in', 'for', 'of'];
    const words = text.split(/\W+/).filter(word => word.length > 2 && !noiseWords.includes(word.toLowerCase()));

    // Return unique keywords, prioritized by length
    return Array.from(new Set(words)).sort((a, b) => b.length - a.length);
}

async function findXPathUsingKeywords(page, keywords) {
    const categoryXPaths = [];

    const xpathPatterns = [
        "//a[contains(text(), '${keyword}')]",
        "//button[contains(text(), '${keyword}')]",
        "//div[contains(text(), '${keyword}')]",
        "//h1[contains(text(), '${keyword}')]",
        "//h2[contains(text(), '${keyword}')]",
        "//h3[contains(text(), '${keyword}')]",
        "//li[contains(text(), '${keyword}')]"
    ];

    for (const keyword of keywords) {
        const xpaths = xpathPatterns.map(pattern => pattern.replace('{keyword}', keyword));

        const results = await Promise.all(
            xpaths.map(xpath => page.evaluate(xpath => {
                const nodes = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                return Array.from({ length: nodes.snapshotLength }, (_, i) => nodes.snapshotItem(i));
            }, xpath))
        );

        const foundElements = results.flat().filter(element => element.length > 0);
        if (foundElements.length > 0) {
            return xpaths[0];
        }
    }

    if (categoryXPaths.length > 0) {
        return categoryXPaths[0];
    }
    console.log("No XPath found using OCR!");
}

function getTesseractLanguageCode(language) {
    const languageMap = {
        'en': 'eng', // English
        'fr': 'fra', // French
        'es': 'spa', // Spanish
        'de': 'deu', // German
        'it': 'ita', // Italian
        'pt': 'por'  // Portuguese
    };

    return languageMap[language] || 'eng'; // Default to English
}
