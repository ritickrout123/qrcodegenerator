#!/usr/bin/env node

import fetch from 'node-fetch';

const FRONTEND_URL = 'http://localhost:5173';
const API_BASE = 'http://localhost:3001/api';

let issues = [];

function logIssue(category, severity, description, fix = null) {
  const issue = { category, severity, description, fix, timestamp: new Date().toISOString() };
  issues.push(issue);
  
  const severityIcon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
  console.log(`${severityIcon} [${severity}] ${category}: ${description}`);
  if (fix) {
    console.log(`   💡 Fix: ${fix}`);
  }
}

async function testCORSConfiguration() {
  try {
    // Test CORS preflight
    const response = await fetch(`${API_BASE}/generate-qr`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    if (!response.headers.get('access-control-allow-origin')) {
      logIssue('CORS', 'HIGH', 'CORS headers missing for preflight requests', 
        'Add proper CORS preflight handling in server/index.js');
    }
  } catch (error) {
    logIssue('CORS', 'HIGH', `CORS test failed: ${error.message}`, 
      'Check CORS configuration in server');
  }
}

async function testHardcodedLocalhost() {
  // Check for hardcoded localhost URLs that won't work in production
  const files = [
    'src/hooks/useQRGenerator.ts',
    'server/index.js'
  ];

  for (const file of files) {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(file, 'utf8');

      // Check if environment variables are being used instead of hardcoded URLs
      if (content.includes('import.meta.env.VITE_API_BASE_URL') || content.includes('process.env.SERVER_BASE_URL')) {
        console.log(`✅ ${file}: Using environment variables for URLs`);
      } else if (content.includes('localhost:3001') || content.includes('localhost:5173')) {
        logIssue('Configuration', 'HIGH',
          `Hardcoded localhost URLs found in ${file}`,
          'Use environment variables for API URLs');
      }
    } catch (error) {
      logIssue('Configuration', 'MEDIUM', `Could not read ${file}: ${error.message}`);
    }
  }
}

async function testQRCodeDownload() {
  // Test if QR code download functionality works
  try {
    // Generate a QR code first
    const qrResponse = await fetch(`${API_BASE}/generate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'link',
        data: { urls: { web: 'https://example.com' } }
      })
    });

    if (!qrResponse.ok) {
      logIssue('QR Download', 'HIGH', 'Cannot generate QR for download test');
      return;
    }

    // The download functionality relies on canvas element which we can't test here
    // But we can check if the logic exists
    logIssue('QR Download', 'MEDIUM', 
      'QR download relies on canvas.toDataURL() which may not work on all browsers',
      'Add fallback download method or better error handling');

  } catch (error) {
    logIssue('QR Download', 'HIGH', `QR download test failed: ${error.message}`);
  }
}

async function testMobileResponsiveness() {
  // Check if the app handles mobile viewports properly
  logIssue('Mobile', 'MEDIUM', 
    'Mobile responsiveness needs manual testing on actual devices',
    'Test on iOS Safari, Android Chrome, and various screen sizes');
}

async function testBrowserCompatibility() {
  // Check for potential browser compatibility issues
  const compatibilityIssues = [
    {
      feature: 'navigator.clipboard.writeText()',
      issue: 'Copy functionality may not work in older browsers or non-HTTPS contexts',
      fix: 'Add fallback copy method using document.execCommand() or show manual copy instructions'
    },
    {
      feature: 'canvas.toDataURL()',
      issue: 'QR download may fail in some browsers or with CORS restrictions',
      fix: 'Add error handling and alternative download methods'
    },
    {
      feature: 'CSS Grid and Flexbox',
      issue: 'Layout may break in very old browsers',
      fix: 'Add CSS fallbacks or polyfills if supporting IE11'
    }
  ];

  compatibilityIssues.forEach(item => {
    logIssue('Browser Compatibility', 'MEDIUM', item.issue, item.fix);
  });
}

async function testErrorHandling() {
  // Test various error scenarios
  const errorTests = [
    {
      name: 'Invalid URL format',
      data: { type: 'link', data: { urls: { web: 'not-a-url' } } }
    },
    {
      name: 'Empty required fields',
      data: { type: 'wifi', data: { ssid: '', password: '' } }
    },
    {
      name: 'Server unavailable',
      endpoint: 'http://localhost:9999/api/generate-qr'
    }
  ];

  for (const test of errorTests) {
    try {
      const endpoint = test.endpoint || `${API_BASE}/generate-qr`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data || {})
      });

      if (test.name === 'Server unavailable') {
        // This should fail
        logIssue('Error Handling', 'MEDIUM', 
          'Frontend should handle server unavailable gracefully',
          'Add better error messages and retry logic');
      } else if (!response.ok && test.name !== 'Server unavailable') {
        // Good - server is rejecting invalid data
        console.log(`✅ Server correctly rejects: ${test.name}`);
      }
    } catch (error) {
      if (test.name === 'Server unavailable') {
        console.log(`✅ Server unavailable test working as expected`);
      } else {
        logIssue('Error Handling', 'HIGH', 
          `Error handling test failed for ${test.name}: ${error.message}`);
      }
    }
  }
}

async function testSecurityIssues() {
  // Check if validation utilities exist
  try {
    const fs = await import('fs');
    const validationContent = fs.readFileSync('src/utils/validation.ts', 'utf8');

    if (validationContent.includes('validateURL') && validationContent.includes('MALICIOUS_PATTERNS')) {
      console.log('✅ Input validation and URL security checks implemented');
    } else {
      logIssue('Security', 'HIGH', 'URL validation not properly implemented');
    }
  } catch (error) {
    logIssue('Security', 'HIGH', 'No input validation utilities found');
  }

  // Check for remaining security issues
  const securityChecks = [
    {
      issue: 'No rate limiting on QR generation',
      severity: 'MEDIUM',
      fix: 'Add rate limiting to prevent abuse'
    },
    {
      issue: 'Generated links stored in memory without expiration',
      severity: 'MEDIUM',
      fix: 'Add TTL for generated links and cleanup mechanism'
    }
  ];

  securityChecks.forEach(check => {
    logIssue('Security', check.severity, check.issue, check.fix);
  });
}

async function testProductionReadiness() {
  // Check if environment files exist
  try {
    const fs = await import('fs');
    if (fs.existsSync('.env.production') && fs.existsSync('.env.staging')) {
      console.log('✅ Environment configuration files exist');
    } else {
      logIssue('Production', 'HIGH', 'Missing environment configuration files');
    }
  } catch (error) {
    logIssue('Production', 'HIGH', 'Could not check environment files');
  }

  // Check if health endpoint exists
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      console.log('✅ Health check endpoint implemented');
    } else {
      logIssue('Production', 'HIGH', 'Health check endpoint not working');
    }
  } catch (error) {
    logIssue('Production', 'HIGH', 'No health check endpoint found');
  }

  // Check remaining production readiness issues
  const productionIssues = [
    {
      issue: 'No database persistence',
      fix: 'Replace in-memory storage with database (Redis/PostgreSQL)'
    },
    {
      issue: 'No logging or monitoring',
      fix: 'Add structured logging and error tracking'
    },
    {
      issue: 'No HTTPS enforcement',
      fix: 'Add HTTPS redirect and security headers'
    }
  ];

  productionIssues.forEach(issue => {
    logIssue('Production', 'HIGH', issue.issue, issue.fix);
  });
}

async function runFrontendTests() {
  console.log('🔍 Starting Frontend and Cross-Platform Issue Detection\n');

  await testCORSConfiguration();
  await testHardcodedLocalhost();
  await testQRCodeDownload();
  await testMobileResponsiveness();
  await testBrowserCompatibility();
  await testErrorHandling();
  await testSecurityIssues();
  await testProductionReadiness();

  // Summary
  console.log('\n📊 Issue Summary:');
  const high = issues.filter(i => i.severity === 'HIGH').length;
  const medium = issues.filter(i => i.severity === 'MEDIUM').length;
  const low = issues.filter(i => i.severity === 'LOW').length;

  console.log(`🔴 High Priority: ${high}`);
  console.log(`🟡 Medium Priority: ${medium}`);
  console.log(`🟢 Low Priority: ${low}`);
  console.log(`📈 Total Issues: ${issues.length}`);

  if (high > 0) {
    console.log('\n🚨 High Priority Issues:');
    issues.filter(i => i.severity === 'HIGH').forEach(issue => {
      console.log(`   - ${issue.category}: ${issue.description}`);
    });
  }

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('frontend-issues.json', JSON.stringify(issues, null, 2));
  console.log('\n💾 Detailed issues saved to frontend-issues.json');
}

// Check if servers are running
async function checkServersRunning() {
  try {
    await fetch(`${API_BASE}/links`);
    await fetch(FRONTEND_URL);
    return true;
  } catch (error) {
    console.log('❌ Servers not running. Please start both:');
    console.log('   Terminal 1: npm run server');
    console.log('   Terminal 2: npm run dev');
    return false;
  }
}

if (await checkServersRunning()) {
  await runFrontendTests();
} else {
  process.exit(1);
}
