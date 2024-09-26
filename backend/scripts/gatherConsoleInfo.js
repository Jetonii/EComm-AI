async function gatherConsoleInfo(page) {
    const consoleMessages = [];

    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    return consoleMessages;
}

module.exports = { gatherConsoleInfo };

// Usage example:
// const { gatherConsoleInfo } = require('./gatherConsoleInfo');
// (async () => {
//   const { page } = await navigateToPage('https://www.gerryweber.com/de-de/');
//   const consoleInfo = await gatherConsoleInfo(page);
//   console.log(consoleInfo);
// })();
