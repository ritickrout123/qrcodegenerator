import { v4 as uuidv4 } from 'uuid';

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
      // For multi-platform links, encode data in URL parameters
      const shortId = uuidv4().slice(0, 8);
      const linkData = {
        ios: encodeURIComponent(data.urls.ios || data.urls.web),
        android: encodeURIComponent(data.urls.android || data.urls.web),
        web: encodeURIComponent(data.urls.web),
        type: 'multi'
      };
      
      const shortUrl = `${baseUrl}/.netlify/functions/redirect?id=${shortId}&ios=${linkData.ios}&android=${linkData.android}&web=${linkData.web}&type=${linkData.type}`;
      
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
      const targetUrl = encodeURIComponent(data.url);
      const shortUrl = `${baseUrl}/.netlify/functions/redirect?id=${shortId}&target=${targetUrl}&type=simple`;
      
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
