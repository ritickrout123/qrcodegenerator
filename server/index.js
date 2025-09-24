import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { UAParser } from 'ua-parser-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Environment configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || `http://localhost:${PORT}`;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const LINK_EXPIRY_HOURS = parseInt(process.env.LINK_EXPIRY_HOURS) || 24;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

console.log(`Starting QR Generator server in ${NODE_ENV} mode`);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for QR links (in production, use a database)
const qrLinks = new Map();

// Generate QR code data endpoint
app.post('/api/generate-qr', (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'link' && data.urls) {
      // For multi-platform links, create a short link
      const shortId = uuidv4().slice(0, 8);
      const shortUrl = `${SERVER_BASE_URL}/r/${shortId}`;
      
      qrLinks.set(shortId, {
        iosUrl: data.urls.ios || data.urls.web,
        androidUrl: data.urls.android || data.urls.web,
        webUrl: data.urls.web,
        type: 'multi-platform',
        createdAt: new Date()
      });
      
      res.json({ qrData: shortUrl, shortId });
    } else if (type === 'wifi') {
      // Generate Wi-Fi QR string
      const wifiString = `WIFI:T:${data.security};S:${data.ssid};P:${data.password};H:${data.hidden ? 'true' : 'false'};;`;
      res.json({ qrData: wifiString });
    } else if (type === 'phone') {
      res.json({ qrData: `tel:${data.phone}` });
    } else if (type === 'appstore') {
      res.json({ qrData: data.url });
    } else if (type === 'qrdylink') {
      const shortId = uuidv4().slice(0, 6);
      const shortUrl = `${SERVER_BASE_URL}/q/${shortId}`;
      
      qrLinks.set(shortId, {
        targetUrl: data.url,
        type: 'simple-redirect',
        createdAt: new Date()
      });
      
      res.json({ qrData: shortUrl, shortId });
    } else {
      res.json({ qrData: data.url || data.text });
    }
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

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

// Redirect endpoint for multi-platform links
app.get('/r/:shortId', (req, res) => {
  const { shortId } = req.params;
  const linkData = qrLinks.get(shortId);
  
  if (!linkData) {
    return res.status(404).send('Link not found');
  }
  
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  
  let redirectUrl = linkData.webUrl; // Default fallback
  
  // Device detection logic with iOS-specific handling
  if (os.name === 'iOS' || device.vendor === 'Apple') {
    redirectUrl = linkData.iosUrl || linkData.webUrl;
    
    // Fix iOS App Store URLs to work properly
    if (redirectUrl && redirectUrl.includes('apps.apple.com')) {
      // Convert regular App Store URL to itms-apps:// format for better app opening
      redirectUrl = convertToiOSAppStoreURL(redirectUrl);
    }
  } else if (os.name === 'Android') {
    redirectUrl = linkData.androidUrl || linkData.webUrl;
  }
  
  console.log(`Redirecting ${os.name || 'Unknown'} device to: ${redirectUrl}`);
  
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
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(htmlBody);
  }
  
  // For all other URLs, use standard redirect
  res.redirect(302, redirectUrl);
});

// Simple redirect endpoint for QrdyLink
app.get('/q/:shortId', (req, res) => {
  const { shortId } = req.params;
  const linkData = qrLinks.get(shortId);
  
  if (!linkData) {
    return res.status(404).send('Link not found');
  }
  
  res.redirect(302, linkData.targetUrl);
});

// Get all generated links (for admin/debugging)
app.get('/api/links', (req, res) => {
  const links = Array.from(qrLinks.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
  res.json(links);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT,"0.0.0.0", () => {
  console.log(`QR Generator server running on ${SERVER_BASE_URL}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
  console.log(`Health check: ${SERVER_BASE_URL}/health`);
});