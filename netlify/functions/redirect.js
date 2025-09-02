import { UAParser } from 'ua-parser-js';

// In-memory storage for demo (use a database in production)
// Note: In production, you'd want to use a persistent database
const qrLinks = new Map();

export const handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing link ID',
    };
  }

  const linkData = qrLinks.get(id);
  
  if (!linkData) {
    return {
      statusCode: 404,
      body: 'Link not found',
    };
  }

  const userAgent = event.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  
  let redirectUrl = linkData.webUrl || linkData.targetUrl; // Default fallback
  
  if (linkData.type === 'multi-platform') {
    // Device detection logic
    if (os.name === 'iOS' || device.vendor === 'Apple') {
      redirectUrl = linkData.iosUrl || linkData.webUrl;
    } else if (os.name === 'Android') {
      redirectUrl = linkData.androidUrl || linkData.webUrl;
    }
  } else if (linkData.type === 'simple-redirect') {
    redirectUrl = linkData.targetUrl;
  }
  
  console.log(`Redirecting ${os.name || 'Unknown'} device to: ${redirectUrl}`);
  
  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};
