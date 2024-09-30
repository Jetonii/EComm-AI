
import puppeteer from "puppeteer";
import { saveToCSV } from "../utils/csvUtils.js";
import { addApiErrorListener, addImageErrorListener, addSourceCodeErrorListener } from "../utils/dataRetrievingUtils.js";
import { detectLanguage } from "../utils/detectLanguage.js";
import { askAIForProductPageInfo } from "../utils/AIUtils.js";
import { parseProductInfoFromAIResponse } from "../utils/parserUtils.js";

async function gatherProductPageInfo(pageUrl) {
    const logsData = [];
    const urlMetadata = initializeUrlMetadata(pageUrl);

    const { browser, page } = await setupPage(logsData, urlMetadata);

    await page.goto(pageUrl, { waitUntil: 'networkidle0' });

    var language = await detectLanguage(page);
    urlMetadata.language = language;
    urlMetadata.title = await page.title();

    let pageDomain = (new URL(pageUrl)).hostname;

    const screenshotPath = `./screenshots/${pageDomain}-ProductPage.png`;
    await page.screenshot({ path: screenshotPath });

    const AIResponse = await askAIForProductPageInfo(screenshotPath);
    
    const { price, discountPrice, productName } = await parseProductInfoFromAIResponse(AIResponse.message.content)

    urlMetadata.productPrice = price; 
    urlMetadata.productDiscountPrice = discountPrice;
    urlMetadata.productName = productName;

    await browser.close();

    const urlMetadataPath = `./output/${pageDomain}-ProductPage-Metadata.csv`
    await saveToCSV(urlMetadata, urlMetadataPath);
    if (logsData.length > 0) {
        const errorInfoPath = `./output/${pageDomain}-ProductPage-Info.csv`
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
        totalImageErrors: 0, 
        productPrice: '', 
        productDiscountPrice: '', 
        productName: ''
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

await gatherProductPageInfo("https://gjirafa50.com/apple-iphone-16-pro-128gb-black-titanium?utm_source=def-product&utm_medium=homepage&utm_campaign=homepage-featured-products");

