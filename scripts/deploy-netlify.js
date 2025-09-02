#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚀 Netlify Deployment Helper\n');

// Check if netlify.toml exists
if (!fs.existsSync('netlify.toml')) {
  console.error('❌ netlify.toml not found. Make sure you\'re in the project root directory.');
  process.exit(1);
}

// Check if Netlify functions exist
if (!fs.existsSync('netlify/functions')) {
  console.error('❌ Netlify functions directory not found.');
  process.exit(1);
}

console.log('✅ Netlify configuration files found');

// Read package.json to check dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['uuid', 'ua-parser-js'];
const missingDeps = requiredDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
);

if (missingDeps.length > 0) {
  console.warn(`⚠️  Missing dependencies for Netlify functions: ${missingDeps.join(', ')}`);
  console.log('Run: npm install ' + missingDeps.join(' '));
}

// Check environment variables
console.log('\n📋 Environment Variables Checklist:');
console.log('Make sure to set these in Netlify Dashboard → Site Settings → Environment Variables:');
console.log('');
console.log('Required:');
console.log('  NODE_ENV=production');
console.log('  VITE_API_BASE_URL=https://YOUR_SITE_NAME.netlify.app/.netlify/functions');
console.log('  VITE_SERVER_BASE_URL=https://YOUR_SITE_NAME.netlify.app');
console.log('');

// Deployment instructions
console.log('🔧 Deployment Steps:');
console.log('');
console.log('1. Git-based Deployment (Recommended):');
console.log('   - Push code to GitHub/GitLab/Bitbucket');
console.log('   - Connect repository in Netlify Dashboard');
console.log('   - Set build command: npm run build');
console.log('   - Set publish directory: dist');
console.log('   - Set functions directory: netlify/functions');
console.log('');
console.log('2. Manual Deployment:');
console.log('   - Run: npm run build');
console.log('   - Run: netlify deploy --prod --dir=dist --functions=netlify/functions');
console.log('');
console.log('3. Local Testing:');
console.log('   - Run: netlify dev');
console.log('   - Test at: http://localhost:8888');
console.log('');

// API endpoints after deployment
console.log('🌐 API Endpoints (after deployment):');
console.log('Replace YOUR_SITE_NAME with your actual Netlify site name:');
console.log('');
console.log('  Frontend: https://YOUR_SITE_NAME.netlify.app');
console.log('  Generate QR: https://YOUR_SITE_NAME.netlify.app/.netlify/functions/generate-qr');
console.log('  Health Check: https://YOUR_SITE_NAME.netlify.app/.netlify/functions/health');
console.log('');

console.log('📚 For detailed instructions, see: NETLIFY_DEPLOYMENT.md');
console.log('');
console.log('🎉 Ready for Netlify deployment!');
