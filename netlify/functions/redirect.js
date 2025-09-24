import { UAParser } from 'ua-parser-js';

// Helper function to convert regular App Store URLs to iOS-friendly format
function convertToiOSAppStoreURL(appStoreUrl) {
  try {
    // Extract app ID from various URL patterns:
    // https://apps.apple.com/app/appname/id123456789
    // https://apps.apple.com/us/app/appname/id123456789
    // https://apps.apple.com/app/id123456789
    // https://itunes.apple.com/app/id123456789
    const idMatch = appStoreUrl.match(/(?:id|\/)([0-9]+)(?:\?|$|#|\/)/i);
    
    if (idMatch && idMatch[1]) {
      const appId = idMatch[1];
      
      // Use itms-apps:// scheme which is more reliable for opening specific apps
      // This bypasses browser issues and opens directly in the App Store app
      return `itms-apps://apps.apple.com/app/id${appId}`;
    }
    
    // If we can't extract an ID but it's still an App Store URL,
    // try to convert the domain to itms-apps
    if (appStoreUrl.includes('apps.apple.com') || appStoreUrl.includes('itunes.apple.com')) {
      return appStoreUrl.replace(/https?:\/\/(apps|itunes)\.apple\.com/, 'itms-apps://apps.apple.com');
    }
  } catch (error) {
    console.log('Error converting iOS URL:', error);
  }
  
  // Return original URL if conversion fails
  return appStoreUrl;
}

export const handler = async (event, context) => {
  const params = event.queryStringParameters || {};
  const { id, type, ios, android, web, target } = params;
  
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing link ID',
    };
  }

  // Check if we have the required parameters
  if (!type) {
    return {
      statusCode: 400,
      body: 'Missing redirect type',
    };
  }

  const userAgent = event.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  
  let redirectUrl;
  
  if (type === 'multi') {
    // Multi-platform redirect with device detection
    if (!ios || !android || !web) {
      return {
        statusCode: 400,
        body: 'Missing URL parameters for multi-platform redirect',
      };
    }
    
    const iosUrl = decodeURIComponent(ios);
    const androidUrl = decodeURIComponent(android);
    const webUrl = decodeURIComponent(web);
    
    // Device detection logic with iOS-specific handling
    if (os.name === 'iOS' || device.vendor === 'Apple') {
      redirectUrl = iosUrl;
      
      // Fix iOS App Store URLs to work properly
      if (iosUrl.includes('apps.apple.com')) {
        // Convert regular App Store URL to itms-apps:// format for better app opening
        redirectUrl = convertToiOSAppStoreURL(iosUrl);
      }
    } else if (os.name === 'Android') {
      redirectUrl = androidUrl;
    } else {
      redirectUrl = webUrl; // Default fallback
    }
  } else if (type === 'simple') {
    // Simple redirect
    if (!target) {
      return {
        statusCode: 400,
        body: 'Missing target URL for simple redirect',
      };
    }
    
    redirectUrl = decodeURIComponent(target);
  } else {
    return {
      statusCode: 400,
      body: 'Invalid redirect type',
    };
  }
  
  console.log(`Redirecting ${os.name || 'Unknown'} device to: ${redirectUrl}`);
  
  // Ensure clean redirect without parameter pollution
  // Don't add https:// to custom schemes like itms-apps://
  if (!redirectUrl.includes('://')) {
    redirectUrl = 'https://' + redirectUrl;
  }
  
  // For iOS itms-apps:// URLs, use HTML meta redirect to avoid parameter pollution
  if (redirectUrl.startsWith('itms-apps://')) {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <title>Redirecting to App Store...</title>
          <script>
            // Fallback JavaScript redirect
            setTimeout(function() {
              window.location.href = '${redirectUrl}';
            }, 100);
          </script>
        </head>
        <body>
          <p>Redirecting to App Store...</p>
          <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
      body: htmlBody,
    };
  }
  
  // For all other URLs, use standard 302 redirect
  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
      'Cache-Control': 'no-cache',
    },
    body: '',
  };
};
