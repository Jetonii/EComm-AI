export async function addApiErrorListener(page, logsData, urlMetadata) {
  page.on('requestfailed', (request) => {
    urlMetadata.totalApiErrors++;
    logsData.push({
      type: 'API Error',
      url: request.url(),
      errorText: request.failure()?.errorText || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  });
}

export async function addSourceCodeErrorListener(page, logsData, urlMetadata) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      urlMetadata.totalSourceCodeErrors++;
      logsData.push({
        type: 'Source Code Error',
        message: msg.text(),
        timestamp: new Date().toISOString(),
      });
    }
  });
}

export async function addImageErrorListener(page, logsData, urlMetadata) {
  await page.evaluate(() => {
    window.imageErrors = [];

    const handleImageError = (img) => { window.imageErrors.push(img.src); };

    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.complete) {
        img.onerror = () => handleImageError(img);
      }
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IMG') {
            node.onerror = () => handleImageError(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every((img) => img.complete || window.imageErrors.includes(img.src));
  }, { timeout: 3000 }); // 3 seconds

  const imageErrors = await page.evaluate(() => window.imageErrors || []);
  urlMetadata.totalImageErrors = imageErrors.length; 

  imageErrors.forEach((src) => {
    logsData.push({
      type: 'Image Error',
      url: src,
      timestamp: new Date().toISOString(),
    });
  });
}
