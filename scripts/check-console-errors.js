const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pages = [
    '/',
    '/login',
    '/signup',
    '/templates',
    '/pricing',
    '/editor',
    '/dashboard'
  ];

  const errors = [];

  for (const pagePath of pages) {
    const page = await browser.newPage();
    const consoleMessages = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    page.on('pageerror', error => {
      errors.push({
        page: pagePath,
        error: error.message
      });
    });

    try {
      await page.goto(`http://localhost:3000${pagePath}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      if (consoleMessages.length > 0) {
        errors.push({
          page: pagePath,
          consoleErrors: consoleMessages
        });
      }
    } catch (error) {
      console.log(`Failed to load ${pagePath}: ${error.message}`);
    }

    await page.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.error('❌ Console errors found:');
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
  } else {
    console.log('✅ No console errors found');
  }
}

checkConsoleErrors().catch(console.error);