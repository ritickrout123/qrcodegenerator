#!/usr/bin/env node

import fetch from 'node-fetch';
import { UAParser } from 'ua-parser-js';

const API_BASE = 'http://localhost:3001/api';
const SERVER_BASE = 'http://localhost:3001';

// Test data
const testCases = {
  multiPlatformLink: {
    type: 'link',
    data: {
      urls: {
        web: 'https://example.com',
        ios: 'https://apps.apple.com/app/test-app',
        android: 'https://play.google.com/store/apps/details?id=com.test.app'
      }
    }
  },
  wifiNetwork: {
    type: 'wifi',
    data: {
      ssid: 'TestNetwork',
      password: 'testpassword123',
      security: 'WPA',
      hidden: false
    }
  },
  phoneNumber: {
    type: 'phone',
    data: {
      phone: '+1234567890'
    }
  },
  appStoreLink: {
    type: 'appstore',
    data: {
      url: 'https://apps.apple.com/app/example-app'
    }
  },
  qrdyLink: {
    type: 'qrdylink',
    data: {
      url: 'https://github.com/example/repo'
    }
  }
};

// User agent strings for testing device detection
const userAgents = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

let testResults = [];
let generatedLinks = [];

function logTest(testName, status, message, details = null) {
  const result = { testName, status, message, details, timestamp: new Date().toISOString() };
  testResults.push(result);
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}: ${message}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
}

async function testQRGeneration(testName, testData) {
  try {
    const response = await fetch(`${API_BASE}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.qrData) {
      throw new Error('No qrData in response');
    }

    // Store generated links for redirect testing
    if (result.shortId) {
      generatedLinks.push({
        shortId: result.shortId,
        type: testData.type,
        qrData: result.qrData
      });
    }

    logTest(testName, 'PASS', 'QR code generated successfully', {
      qrData: result.qrData,
      shortId: result.shortId
    });

    return result;
  } catch (error) {
    logTest(testName, 'FAIL', `QR generation failed: ${error.message}`);
    return null;
  }
}

async function testRedirect(shortId, userAgent, expectedPattern) {
  try {
    const response = await fetch(`${SERVER_BASE}/r/${shortId}`, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      redirect: 'manual'
    });

    if (response.status !== 302) {
      throw new Error(`Expected 302 redirect, got ${response.status}`);
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('No Location header in redirect response');
    }

    const matches = expectedPattern ? location.includes(expectedPattern) : true;
    
    logTest(
      `Redirect test for ${shortId}`,
      matches ? 'PASS' : 'FAIL',
      `Redirected to: ${location}`,
      { expectedPattern, userAgent: userAgent.substring(0, 50) + '...' }
    );

    return location;
  } catch (error) {
    logTest(`Redirect test for ${shortId}`, 'FAIL', `Redirect failed: ${error.message}`);
    return null;
  }
}

async function testDeviceDetection() {
  // Find a multi-platform link from our generated links
  const multiPlatformLink = generatedLinks.find(link => link.type === 'link');
  
  if (!multiPlatformLink) {
    logTest('Device Detection', 'SKIP', 'No multi-platform link available for testing');
    return;
  }

  const shortId = multiPlatformLink.shortId;

  // Test iOS detection
  await testRedirect(shortId, userAgents.ios, 'apps.apple.com');
  
  // Test Android detection
  await testRedirect(shortId, userAgents.android, 'play.google.com');
  
  // Test desktop fallback
  await testRedirect(shortId, userAgents.desktop, 'example.com');
}

async function testWiFiQRFormat() {
  const wifiResult = await testQRGeneration('WiFi QR Generation', testCases.wifiNetwork);
  
  if (wifiResult && wifiResult.qrData) {
    const expectedFormat = /^WIFI:T:WPA;S:TestNetwork;P:testpassword123;H:false;;$/;
    const isValidFormat = expectedFormat.test(wifiResult.qrData);
    
    logTest(
      'WiFi QR Format',
      isValidFormat ? 'PASS' : 'FAIL',
      `WiFi QR format ${isValidFormat ? 'correct' : 'incorrect'}`,
      { qrData: wifiResult.qrData, expectedPattern: expectedFormat.toString() }
    );
  }
}

async function testPhoneQRFormat() {
  const phoneResult = await testQRGeneration('Phone QR Generation', testCases.phoneNumber);
  
  if (phoneResult && phoneResult.qrData) {
    const expectedFormat = 'tel:+1234567890';
    const isValidFormat = phoneResult.qrData === expectedFormat;
    
    logTest(
      'Phone QR Format',
      isValidFormat ? 'PASS' : 'FAIL',
      `Phone QR format ${isValidFormat ? 'correct' : 'incorrect'}`,
      { qrData: phoneResult.qrData, expected: expectedFormat }
    );
  }
}

async function testServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/links`);
    if (response.ok) {
      const links = await response.json();
      logTest('Server Health', 'PASS', `Server responding, ${links.length} links stored`);
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    logTest('Server Health', 'FAIL', `Server health check failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting QR Code Functionality Tests\n');
  
  // Test server health first
  await testServerHealth();
  
  // Test QR generation for all types
  await testQRGeneration('Multi-platform Link', testCases.multiPlatformLink);
  await testQRGeneration('App Store Link', testCases.appStoreLink);
  await testQRGeneration('QrdyLink', testCases.qrdyLink);
  await testWiFiQRFormat();
  await testPhoneQRFormat();
  
  // Test device detection and redirects
  await testDeviceDetection();
  
  // Summary
  console.log('\n📊 Test Summary:');
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`📈 Total: ${testResults.length}`);
  
  if (failed > 0) {
    console.log('\n🔍 Failed Tests:');
    testResults.filter(r => r.status === 'FAIL').forEach(test => {
      console.log(`   - ${test.testName}: ${test.message}`);
    });
  }
  
  // Save detailed results
  const fs = await import('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  console.log('\n💾 Detailed results saved to test-results.json');
}

// Check if server is running before starting tests
async function checkServerRunning() {
  try {
    await fetch(`${SERVER_BASE}/api/links`);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run server');
    return false;
  }
}

// Main execution
if (await checkServerRunning()) {
  await runAllTests();
} else {
  process.exit(1);
}
