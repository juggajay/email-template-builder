const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeNextBuild() {
  const buildDir = path.join(__dirname, '../.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.error('No .next/static directory found. Please run "npm run build" first.');
    return;
  }
  
  const stats = {
    chunks: {},
    css: {},
    total: {
      js: 0,
      css: 0,
    },
  };
  
  // Analyze JS chunks
  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const size = fs.statSync(filePath).size;
        stats.chunks[file] = size;
        stats.total.js += size;
      }
    });
  }
  
  // Analyze CSS files
  const cssDir = path.join(staticDir, 'css');
  if (fs.existsSync(cssDir)) {
    const files = fs.readdirSync(cssDir);
    files.forEach(file => {
      if (file.endsWith('.css')) {
        const filePath = path.join(cssDir, file);
        const size = fs.statSync(filePath).size;
        stats.css[file] = size;
        stats.total.css += size;
      }
    });
  }
  
  // Sort by size
  const sortedChunks = Object.entries(stats.chunks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  console.log('=== Next.js Bundle Analysis ===\n');
  
  console.log('Top 10 JavaScript Chunks:');
  sortedChunks.forEach(([file, size]) => {
    console.log(`  ${file}: ${formatBytes(size)}`);
  });
  
  console.log('\nCSS Files:');
  Object.entries(stats.css).forEach(([file, size]) => {
    console.log(`  ${file}: ${formatBytes(size)}`);
  });
  
  console.log('\nTotal Bundle Size:');
  console.log(`  JavaScript: ${formatBytes(stats.total.js)}`);
  console.log(`  CSS: ${formatBytes(stats.total.css)}`);
  console.log(`  Total: ${formatBytes(stats.total.js + stats.total.css)}`);
  
  // Recommendations
  console.log('\n=== Recommendations ===');
  
  if (stats.total.js > 1024 * 1024) {
    console.log('⚠️  JavaScript bundle is over 1MB. Consider:');
    console.log('   - Code splitting with dynamic imports');
    console.log('   - Tree shaking unused imports');
    console.log('   - Lazy loading heavy components');
  }
  
  const largeChunks = sortedChunks.filter(([, size]) => size > 200 * 1024);
  if (largeChunks.length > 0) {
    console.log(`\n⚠️  ${largeChunks.length} chunks are over 200KB:`);
    largeChunks.forEach(([file, size]) => {
      console.log(`   - ${file}: ${formatBytes(size)}`);
    });
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    chunks: stats.chunks,
    css: stats.css,
    total: stats.total,
    recommendations: [],
  };
  
  if (stats.total.js > 1024 * 1024) {
    report.recommendations.push('Reduce JavaScript bundle size');
  }
  
  if (largeChunks.length > 0) {
    report.recommendations.push(`Split ${largeChunks.length} large chunks`);
  }
  
  const reportPath = path.join(__dirname, '../bundle-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

analyzeNextBuild();