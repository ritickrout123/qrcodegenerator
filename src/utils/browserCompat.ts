// Browser compatibility utilities for clipboard and download functionality

export interface CopyResult {
  success: boolean;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  error?: string;
}

// Check if the browser supports the modern clipboard API
export function isClipboardAPISupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}

// Check if we're in a secure context (required for clipboard API)
export function isSecureContext(): boolean {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
}

// Modern clipboard API copy
async function copyWithClipboardAPI(text: string): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Clipboard API failed' 
    };
  }
}

// Fallback copy using execCommand (deprecated but widely supported)
function copyWithExecCommand(text: string): CopyResult {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.focus();
    textarea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      return { success: true };
    } else {
      return { success: false, error: 'execCommand copy failed' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'execCommand copy failed' 
    };
  }
}

// Cross-browser copy function with fallbacks
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // First try modern clipboard API if available and in secure context
  if (isClipboardAPISupported() && isSecureContext()) {
    const result = await copyWithClipboardAPI(text);
    if (result.success) {
      return result;
    }
    // If clipboard API fails, fall back to execCommand
  }
  
  // Fallback to execCommand
  const execResult = copyWithExecCommand(text);
  if (execResult.success) {
    return execResult;
  }
  
  // If both methods fail, return error with instructions
  return {
    success: false,
    error: 'Copy failed. Please manually select and copy the text.'
  };
}

// Check if canvas toDataURL is supported
export function isCanvasDownloadSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d') && canvas.toDataURL);
  } catch {
    return false;
  }
}

// Modern download using canvas toDataURL
function downloadWithCanvas(canvas: HTMLCanvasElement, filename: string): DownloadResult {
  try {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Canvas download failed'
    };
  }
}

// Fallback download by opening canvas in new window
function downloadWithNewWindow(canvas: HTMLCanvasElement): DownloadResult {
  try {
    const url = canvas.toDataURL('image/png');
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code</title></head>
          <body style="margin:0;padding:20px;text-align:center;">
            <h3>Right-click the image and select "Save image as..."</h3>
            <img src="${url}" alt="QR Code" style="border:1px solid #ccc;"/>
          </body>
        </html>
      `);
      return { success: true };
    } else {
      return { success: false, error: 'Popup blocked' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'New window download failed'
    };
  }
}

// Cross-browser download function with fallbacks
export function downloadQRCode(filename: string): DownloadResult {
  // Find the canvas element
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) {
    return { success: false, error: 'QR code canvas not found' };
  }
  
  // Check if canvas download is supported
  if (!isCanvasDownloadSupported()) {
    return { success: false, error: 'Canvas download not supported in this browser' };
  }
  
  // Try direct download first
  const directResult = downloadWithCanvas(canvas, filename);
  if (directResult.success) {
    return directResult;
  }
  
  // Fallback to new window method
  const windowResult = downloadWithNewWindow(canvas);
  if (windowResult.success) {
    return windowResult;
  }
  
  // If all methods fail
  return {
    success: false,
    error: 'Download failed. Try right-clicking the QR code and selecting "Save image as..."'
  };
}

// Error handling utility for network requests
export function handleNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error - please check your internet connection and try again';
  }
  
  if (error instanceof Error) {
    if (error.message.includes('CORS')) {
      return 'Cross-origin request blocked - please check server configuration';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out - please try again';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Retry utility for network requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

// Browser detection utilities
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  
  return {
    isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
    isFirefox: /Firefox/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor),
    isEdge: /Edg/.test(userAgent),
    isIE: /Trident/.test(userAgent),
    isMobile: /Mobi|Android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent)
  };
}

// Feature detection
export function getFeatureSupport() {
  return {
    clipboard: isClipboardAPISupported(),
    secureContext: isSecureContext(),
    canvas: isCanvasDownloadSupported(),
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined'
  };
}
