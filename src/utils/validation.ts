// URL validation and security utilities

// Common malicious URL patterns and domains to block
const MALICIOUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /ftp:/i,
];

const SUSPICIOUS_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  // Add more suspicious domains as needed
];

const BLOCKED_DOMAINS = [
  'malware.com',
  'phishing.com',
  // Add known malicious domains
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export function validateURL(url: string, context?: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  // Basic URL format validation
  try {
    const urlObj = new URL(url);
    
    // Check for malicious protocols
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(url)) {
        return { isValid: false, error: 'Invalid or potentially dangerous URL protocol' };
      }
    }

    // Check for blocked domains
    const domain = urlObj.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some(blocked => domain.includes(blocked))) {
      return { isValid: false, error: 'This domain is blocked for security reasons' };
    }

    // Check for suspicious domains (warning, not blocking)
    if (SUSPICIOUS_DOMAINS.some(suspicious => domain.includes(suspicious))) {
      return { 
        isValid: true, 
        warning: 'This appears to be a URL shortener. Consider using the direct URL for better security.' 
      };
    }

    // Ensure HTTPS for external URLs (except localhost)
    if (!domain.includes('localhost') && !domain.includes('127.0.0.1') && urlObj.protocol !== 'https:') {
      return { 
        isValid: true, 
        warning: 'Consider using HTTPS for better security' 
      };
    }

    // Specific validation for App Store URLs
    if (context === 'ios' && domain.includes('apps.apple.com')) {
      const hasAppId = url.match(/id\d+/);
      if (!hasAppId) {
        return {
          isValid: false,
          error: 'iOS App Store URL must include app ID (e.g., /id123456789)'
        };
      }
      
      return {
        isValid: true,
        warning: 'Make sure this App Store URL is correct - it will open directly in the App Store app'
      };
    }

    // Specific validation for Play Store URLs
    if (context === 'android' && domain.includes('play.google.com')) {
      const hasPackageName = url.includes('id=') || url.includes('details?id=');
      if (!hasPackageName) {
        return {
          isValid: false,
          error: 'Android Play Store URL must include package ID (e.g., ?id=com.example.app)'
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters except + for international prefix
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Basic phone number validation
  if (cleanPhone.length < 7) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  if (cleanPhone.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  // Check for valid international format
  const internationalPattern = /^\+[1-9]\d{6,14}$/;
  const localPattern = /^\d{7,15}$/;

  if (!internationalPattern.test(cleanPhone) && !localPattern.test(cleanPhone)) {
    return { isValid: false, error: 'Invalid phone number format. Use +1234567890 or 1234567890' };
  }

  return { isValid: true };
}

export function validateWiFiCredentials(ssid: string, password: string, security: string): ValidationResult {
  if (!ssid || ssid.trim() === '') {
    return { isValid: false, error: 'Network name (SSID) is required' };
  }

  if (ssid.length > 32) {
    return { isValid: false, error: 'Network name cannot exceed 32 characters' };
  }

  // Check for potentially problematic characters in SSID
  if (/[;"\\]/.test(ssid)) {
    return { isValid: false, error: 'Network name contains invalid characters' };
  }

  if (security !== 'nopass') {
    if (!password || password.trim() === '') {
      return { isValid: false, error: 'Password is required for secured networks' };
    }

    if (security === 'WPA' && password.length < 8) {
      return { isValid: false, error: 'WPA password must be at least 8 characters long' };
    }

    if (security === 'WEP' && ![5, 13, 10, 26].includes(password.length)) {
      return { isValid: false, error: 'WEP password must be 5, 10, 13, or 26 characters long' };
    }

    // Check for potentially problematic characters in password
    if (/[;"\\]/.test(password)) {
      return { isValid: false, error: 'Password contains invalid characters' };
    }
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>'"&]/g, '') // Remove HTML/XML characters
    .replace(/[;\\\r\n]/g, '') // Remove command injection characters
    .trim();
}

export function validateFormData(formData: any): ValidationResult {
  switch (formData.type) {
    case 'link':
      if (!formData.urls?.web) {
        return { isValid: false, error: 'Web URL is required' };
      }
      
      const webValidation = validateURL(formData.urls.web);
      if (!webValidation.isValid) {
        return webValidation;
      }

      // Validate optional iOS and Android URLs with context
      if (formData.urls.ios) {
        const iosValidation = validateURL(formData.urls.ios, 'ios');
        if (!iosValidation.isValid) {
          return { isValid: false, error: `iOS URL: ${iosValidation.error}` };
        }
        if (iosValidation.warning) {
          return { isValid: true, warning: `iOS URL: ${iosValidation.warning}` };
        }
      }

      if (formData.urls.android) {
        const androidValidation = validateURL(formData.urls.android, 'android');
        if (!androidValidation.isValid) {
          return { isValid: false, error: `Android URL: ${androidValidation.error}` };
        }
        if (androidValidation.warning) {
          return { isValid: true, warning: `Android URL: ${androidValidation.warning}` };
        }
      }

      return webValidation;

    case 'appstore':
    case 'qrdylink':
      if (!formData.url) {
        return { isValid: false, error: 'URL is required' };
      }
      return validateURL(formData.url);

    case 'wifi':
      return validateWiFiCredentials(formData.ssid, formData.password, formData.security || 'WPA');

    case 'phone':
      if (!formData.phone) {
        return { isValid: false, error: 'Phone number is required' };
      }
      return validatePhoneNumber(formData.phone);

    default:
      return { isValid: false, error: 'Invalid QR code type' };
  }
}
