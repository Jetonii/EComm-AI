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