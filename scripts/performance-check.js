const puppeteer = require('puppeteer');

async function checkPerformance() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const performanceResults = [];
  const pages = ['/', '/templates', '/pricing'];

  for (const pagePath of pages) {
    const page = await browser.newPage();

    try {
      await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle0' });

      const metrics = await page.metrics();
      const performance = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstPaint: perfData.responseEnd - perfData.requestStart,
          domInteractive: perfData.domInteractive - perfData.navigationStart
        };
      });

      performanceResults.push({
        page: pagePath,
        metrics: {
          JSHeapUsedSize: (metrics.JSHeapUsedSize / 1048576).toFixed(2) + ' MB',
          Timestamp: metrics.Timestamp,
          performance
        }
      });

      // Check if page loads within acceptable time
      if (performance.loadComplete > 3000) {
        console.warn(`⚠️  ${pagePath} took ${performance.loadComplete}ms to load (threshold: 3000ms)`);
      }
    } catch (error) {
      console.error(`Failed to check performance for ${pagePath}: ${error.message}`);
    }

    await page.close();
  }

  await browser.close();

  console.log('📊 Performance Results:');
  console.log(JSON.stringify(performanceResults, null, 2));
}

checkPerformance().catch(console.error);