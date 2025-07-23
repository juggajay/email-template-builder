#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      }
    }
  } catch (err) {
    // Directory might not exist
  }
  
  return totalSize;
}

function getBuildInfo() {
  console.log(`${colors.bright}${colors.blue}🚀 Next.js Build Information${colors.reset}\n`);
  
  // Check if .next directory exists
  if (!fs.existsSync('.next')) {
    console.log(`${colors.red}❌ No build found. Run 'npm run build' first.${colors.reset}`);
    return;
  }
  
  // Build timestamp
  const buildTime = fs.statSync('.next').mtime;
  console.log(`${colors.cyan}📅 Build Time:${colors.reset} ${buildTime.toLocaleString()}`);
  
  // Git info
  try {
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
    console.log(`${colors.cyan}🌿 Git Branch:${colors.reset} ${gitBranch}`);
    console.log(`${colors.cyan}📌 Git Commit:${colors.reset} ${gitCommit}`);
  } catch (err) {
    // Git might not be available
  }
  
  console.log('\n' + colors.bright + 'Bundle Sizes:' + colors.reset);
  
  // Calculate sizes
  const sizes = {
    'Total .next': getDirectorySize('.next'),
    'Static files': getDirectorySize('.next/static'),
    'JS chunks': getDirectorySize('.next/static/chunks'),
    'CSS files': getDirectorySize('.next/static/css'),
    'Server files': getDirectorySize('.next/server'),
    'Pages': getDirectorySize('.next/server/pages'),
  };
  
  // Display sizes
  const maxLabelLength = Math.max(...Object.keys(sizes).map(k => k.length));
  Object.entries(sizes).forEach(([label, size]) => {
    const paddedLabel = label.padEnd(maxLabelLength);
    const formattedSize = formatBytes(size);
    
    let color = colors.green;
    if (size > 5 * 1024 * 1024) color = colors.yellow; // > 5MB
    if (size > 10 * 1024 * 1024) color = colors.red; // > 10MB
    
    console.log(`  ${paddedLabel} : ${color}${formattedSize}${colors.reset}`);
  });
  
  // Route information
  console.log('\n' + colors.bright + 'Routes:' + colors.reset);
  
  const pagesDir = '.next/server/pages';
  if (fs.existsSync(pagesDir)) {
    const countRoutes = (dir, prefix = '') => {
      let count = 0;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory() && !file.startsWith('_')) {
          count += countRoutes(filePath, `${prefix}/${file}`);
        } else if (file.endsWith('.html') && !file.startsWith('_')) {
          count++;
        }
      }
      
      return count;
    };
    
    const routeCount = countRoutes(pagesDir);
    console.log(`  Total routes: ${colors.cyan}${routeCount}${colors.reset}`);
  }
  
  // Build warnings
  console.log('\n' + colors.bright + 'Optimization Tips:' + colors.reset);
  
  if (sizes['JS chunks'] > 1024 * 1024) {
    console.log(`  ${colors.yellow}⚠️  JS chunks are large (${formatBytes(sizes['JS chunks'])}). Consider code splitting.${colors.reset}`);
  }
  
  if (sizes['CSS files'] > 200 * 1024) {
    console.log(`  ${colors.yellow}⚠️  CSS files are large (${formatBytes(sizes['CSS files'])}). Consider removing unused styles.${colors.reset}`);
  }
  
  // Check for source maps in production
  const hasSourceMaps = fs.existsSync('.next/static/chunks') && 
    fs.readdirSync('.next/static/chunks').some(f => f.endsWith('.map'));
  
  if (hasSourceMaps) {
    console.log(`  ${colors.yellow}⚠️  Source maps detected. Disable for production builds.${colors.reset}`);
  }
  
  console.log(`\n${colors.dim}Run 'npm run build:analyze' for detailed bundle analysis${colors.reset}`);
}

// Run the script
getBuildInfo();