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
  
  // Device detection logic
  if (os.name === 'iOS' || device.vendor === 'Apple') {
    redirectUrl = linkData.iosUrl || linkData.webUrl;
  } else if (os.name === 'Android') {
    redirectUrl = linkData.androidUrl || linkData.webUrl;
  }
  
  console.log(`Redirecting ${os.name || 'Unknown'} device to: ${redirectUrl}`);
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

app.listen(PORT, () => {
  console.log(`QR Generator server running on ${SERVER_BASE_URL}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
  console.log(`Health check: ${SERVER_BASE_URL}/health`);
});