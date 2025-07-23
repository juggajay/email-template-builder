const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Performance metrics to track
const metrics = {
  pageLoad: [],
  templateRender: [],
  editorLoad: [],
  firstPaint: [],
  domContentLoaded: [],
  largestContentfulPaint: [],
};

async function measurePageLoad(page, url, name) {
  const startTime = Date.now();
  
  // Start collecting metrics
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Get performance metrics
  const performanceMetrics = await page.evaluate(() => {
    const paintEntries = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
      loadComplete: navigation?.loadEventEnd || 0,
    };
  });
  
  const loadTime = Date.now() - startTime;
  
  metrics.pageLoad.push({ name, time: loadTime });
  metrics.firstPaint.push({ name, time: performanceMetrics.firstPaint });
  metrics.domContentLoaded.push({ name, time: performanceMetrics.domContentLoaded });
  
  console.log(`${name}: ${loadTime}ms (FP: ${performanceMetrics.firstPaint}ms, DCL: ${performanceMetrics.domContentLoaded}ms)`);
  
  return performanceMetrics;
}

async function measureTemplateOperations(page) {
  await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle' });
  
  // Measure template grid render
  const renderTime = await page.evaluate(async () => {
    const start = performance.now();
    
    // Wait for templates to render
    await new Promise(resolve => {
      const observer = new MutationObserver((mutations, obs) => {
        const templates = document.querySelectorAll('[data-testid="template-card"]');
        if (templates.length > 0) {
          obs.disconnect();
          resolve();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
    
    return performance.now() - start;
  });
  
  metrics.templateRender.push({ time: renderTime });
  console.log(`Template grid render: ${renderTime}ms`);
  
  // Measure search performance
  const searchTime = await page.evaluate(async () => {
    const start = performance.now();
    const searchInput = document.querySelector('input[type="search"]');
    
    if (searchInput) {
      searchInput.value = 'welcome';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return performance.now() - start;
  });
  
  console.log(`Template search: ${searchTime}ms`);
}

async function measureEditorPerformance(page) {
  await page.goto('http://localhost:3000/editor', { waitUntil: 'networkidle' });
  
  // Wait for editor to load
  const editorLoadTime = await page.evaluate(async () => {
    const start = performance.now();
    
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.unlayer && document.querySelector('#unlayer-editor iframe')) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
    
    return performance.now() - start;
  });
  
  metrics.editorLoad.push({ time: editorLoadTime });
  console.log(`Editor load: ${editorLoadTime}ms`);
}

async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      pageLoad: {
        average: average(metrics.pageLoad.map(m => m.time)),
        min: Math.min(...metrics.pageLoad.map(m => m.time)),
        max: Math.max(...metrics.pageLoad.map(m => m.time)),
        samples: metrics.pageLoad,
      },
      templateRender: {
        average: average(metrics.templateRender.map(m => m.time)),
        min: Math.min(...metrics.templateRender.map(m => m.time)),
        max: Math.max(...metrics.templateRender.map(m => m.time)),
      },
      editorLoad: {
        average: average(metrics.editorLoad.map(m => m.time)),
        min: Math.min(...metrics.editorLoad.map(m => m.time)),
        max: Math.max(...metrics.editorLoad.map(m => m.time)),
      },
      firstPaint: {
        average: average(metrics.firstPaint.map(m => m.time)),
        min: Math.min(...metrics.firstPaint.map(m => m.time)),
        max: Math.max(...metrics.firstPaint.map(m => m.time)),
      },
    },
  };
  
  // Save report
  const reportPath = path.join(__dirname, '../performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n=== Performance Report ===');
  console.log(`Average page load: ${report.metrics.pageLoad.average.toFixed(2)}ms`);
  console.log(`Average template render: ${report.metrics.templateRender.average.toFixed(2)}ms`);
  console.log(`Average editor load: ${report.metrics.editorLoad.average.toFixed(2)}ms`);
  console.log(`Average first paint: ${report.metrics.firstPaint.average.toFixed(2)}ms`);
  console.log(`\nReport saved to: ${reportPath}`);
  
  return report;
}

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

async function runPerformanceTests() {
  console.log('Starting performance tests...\n');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Test pages
    const pagesToTest = [
      { url: 'http://localhost:3000/', name: 'Homepage' },
      { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
      { url: 'http://localhost:3000/templates', name: 'Templates' },
    ];
    
    // Run page load tests
    console.log('=== Page Load Tests ===');
    for (const { url, name } of pagesToTest) {
      await measurePageLoad(page, url, name);
    }
    
    // Run template operations tests
    console.log('\n=== Template Operations ===');
    await measureTemplateOperations(page);
    
    // Run editor tests
    console.log('\n=== Editor Performance ===');
    await measureEditorPerformance(page);
    
    // Generate report
    await generateReport();
    
  } finally {
    await browser.close();
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('Server is not running. Please start the server with "npm run dev" first.');
    process.exit(1);
  }
  
  await runPerformanceTests();
}

main().catch(console.error);