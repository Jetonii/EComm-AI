import { tryFindProductListXPathUsingOCR } from '../utils/ocrUtils.js';
import xpath from "xpath"

export async function tryFindProductListXPath(page, language) {
    await tryFindProductListXPathUsingOCR(page, language)
}

export async function tryFindXPath(doc, categories, categoriesXPaths) {
    for (const categoryXPath of categoriesXPaths) {
        const nodes = xpath.select(categoryXPath, doc);

        if (nodes.length > 0) {
            console.log("Found category xpath in AI Response xpaths" + categoryXPath)
            return categoryXPath;
        }
    }

    for (const category of categories) {
        const xpathExpression = `//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${category.toLowerCase()}')]`;
        const nodes = xpath.select(xpathExpression, doc);

        if (nodes.length > 0) {
            console.log("Found category xpath in AI Response categories" + category)
            return xpathExpression;
        }
    }
}