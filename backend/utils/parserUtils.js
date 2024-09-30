export async function parseCategoriesFromAIResponse(content) {
    const categoryRegex = /categoriesFound:\s*~(.*?)~/;

    const categoryMatch = categoryRegex.exec(content);
    let categories = [];

    if (categoryMatch) {
        categories = categoryMatch[1].split(',').map(cat => cat.trim());
    }

    const regex = /.+?XPath:\s*~(.*?)~/g;

    const categoriesXPaths = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        categoriesXPaths.push(match[1]);
    }

    return { categories, categoriesXPaths };
}

export async function parseProductInfoFromAIResponse(content) {
    const priceMatch = content.match(/price:\s*'([^']+)'/);
    const discountPriceMatch = content.match(/discountPrice:\s*'([^']+)'/);
    const productNameMatch = content.match(/productName:\s*'([^']+)'/);

    const price = priceMatch ? priceMatch[1] : null;
    const discountPrice = discountPriceMatch ? discountPriceMatch[1] : null;
    const productName = productNameMatch ? productNameMatch[1] : null;

    return { price, discountPrice, productName }
}