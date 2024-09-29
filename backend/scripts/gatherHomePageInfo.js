
import puppeteer from "puppeteer";
import { askAIForHomePageInfo } from "../utils/AIUtils.js";
import { saveToCSV } from "../utils/csvUtils.js";
import { addApiErrorListener, addImageErrorListener, addSourceCodeErrorListener } from "../utils/dataRetrievingUtils.js";
import { detectLanguage } from "../utils/detectLanguage.js";
import { parseCategoriesFromAIResponse } from "../utils/parserUtils.js";
import { DOMParser } from "xmldom";
import sanitizeHtml from "sanitize-html"
import { tryFindXPath } from "./xpathsFinder.js";

async function gatherHomePageInfo(pageUrl) {
    const logsData = [];
    const urlMetadata = initializeUrlMetadata(pageUrl);

    const { browser, page } = await setupPage(logsData, urlMetadata);

    await page.goto(pageUrl, { waitUntil: 'networkidle0' });

    var language = await detectLanguage(page);
    urlMetadata.language = language;
    urlMetadata.title = await page.title();

    let pageDomain = (new URL(pageUrl)).hostname;
    const screenshotPath = `./screenshots/${pageDomain}-HomePage.png`;

    await page.screenshot({ path: screenshotPath });

    const AIResponse = await askAIForHomePageInfo(screenshotPath);

    const { categories, categoriesXPaths } = await parseCategoriesFromAIResponse(AIResponse.message.content);

    try {
        if (categories.length > 0) {
            const htmlContent = await page.content();
            const cleanHtml = sanitizeHtml(htmlContent);
            const doc = new DOMParser().parseFromString(cleanHtml);
            var xpath = await tryFindXPath(doc, categories, categoriesXPaths);

            await page.waitForXPath(xpath);
            const [categoryEl] = await page.$x(xpath);
            if (categoryEl) {
                await categoryEl.click();
            }
        
            await clickFirstProductCategory(page);
        }
    } catch (error) {
        console.log("Error finding product list XPath:", error);
    }

   

    await browser.close();

    const urlMetadataPath = `./output/${pageDomain}-HomePage-sMetadata.csv`
    await saveToCSV(urlMetadata, urlMetadataPath);
    if (logsData.length > 0) {

        const errorInfoPath = `./output/${pageDomain}-HomePage-Info.csv`
        await saveToCSV(logsData, errorInfoPath);

        console.log(`Found ${urlMetadata.totalApiErrors} api errors!`);
        console.log(`Found ${urlMetadata.totalSourceCodeErrors} source code errors!`);
        console.log(`Found ${urlMetadata.totalImageErrors} image errors!`);
        console.log(`Logs saved to ${errorInfoPath}`);
    } else {
        console.log('No logs data to save.');
    }
}

function initializeUrlMetadata(pageUrl) {
    return {
        fullUrl: pageUrl,
        title: '',
        language: '',
        totalApiErrors: 0,
        totalSourceCodeErrors: 0,
        totalImageErrors: 0
    };
}

async function setupPage(logsData, urlMetadata) {
    const browser = await puppeteer.launch(
        {
            headless: false,
            args: ['--start-maximized']
        });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    addApiErrorListener(page, logsData, urlMetadata);
    addSourceCodeErrorListener(page, logsData, urlMetadata);
    addImageErrorListener(page, logsData, urlMetadata);

    return { browser, page }
}

await gatherHomePageInfo("https://www.gerryweber.com/en-eu");

async function clickFirstProductCategory(page) {
    // Searching for common categories or product-related elements
    const categoryKeywords = ['Product', 'Category', 'Shop', 'Buy'];

    // Attempt to find any element that matches these keywords
    const foundCategory = await page.evaluate((categoryKeywords) => {
        let categoryElement = null;
        document.querySelectorAll('a, button, div').forEach(el => {
            const text = el.innerText.toLowerCase();
            if (categoryKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
                categoryElement = el;
            }
        });
        if (categoryElement) {
            categoryElement.scrollIntoView();
            categoryElement.click();
            return true;
        }
        return false;
    }, categoryKeywords);

    if (!foundCategory) {
        throw new Error("No category or product list found to click.");
    }
}