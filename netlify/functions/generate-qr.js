import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo (use a database in production)
const qrLinks = new Map();

export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { type, data } = JSON.parse(event.body);
    const baseUrl = process.env.URL || 'https://your-netlify-site.netlify.app';

    if (type === 'link' && data.urls) {
      // For multi-platform links, create a short link
      const shortId = uuidv4().slice(0, 8);
      const shortUrl = `${baseUrl}/.netlify/functions/redirect?id=${shortId}`;
      
      qrLinks.set(shortId, {
        iosUrl: data.urls.ios || data.urls.web,
        androidUrl: data.urls.android || data.urls.web,
        webUrl: data.urls.web,
        type: 'multi-platform',
        createdAt: new Date()
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: shortUrl, shortId }),
      };
    } else if (type === 'wifi') {
      // Generate Wi-Fi QR string
      const wifiString = `WIFI:T:${data.security};S:${data.ssid};P:${data.password};H:${data.hidden ? 'true' : 'false'};;`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: wifiString }),
      };
    } else if (type === 'phone') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: `tel:${data.phone}` }),
      };
    } else if (type === 'appstore') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: data.url }),
      };
    } else if (type === 'qrdylink') {
      const shortId = uuidv4().slice(0, 6);
      const shortUrl = `${baseUrl}/.netlify/functions/redirect?id=${shortId}`;
      
      qrLinks.set(shortId, {
        targetUrl: data.url,
        type: 'simple-redirect',
        createdAt: new Date()
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: shortUrl, shortId }),
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ qrData: data.url || data.text }),
      };
    }
  } catch (error) {
    console.error('Error generating QR:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate QR code' }),
    };
  }
};
