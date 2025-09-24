# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A modern cross-platform QR code generator with device detection and multi-platform support. Built with React + TypeScript frontend and Node.js/Express backend, deployable on both traditional servers and serverless platforms (Netlify).

## Core Architecture

### Frontend (React + TypeScript)
- **Main App**: `src/App.tsx` - Central state management and component orchestration
- **Component Structure**: 
  - `Header.tsx` - Application header
  - `QRTypeSelector.tsx` - QR type selection interface
  - `QRInputForm.tsx` - Dynamic form based on selected QR type
  - `QRCodeDisplay.tsx` - QR code rendering and download/copy functionality
- **Custom Hook**: `src/hooks/useQRGenerator.ts` - Handles QR generation API calls with retry logic
- **Types**: `src/types/qr.ts` - TypeScript definitions for QR data structures
- **Utilities**:
  - `src/utils/validation.ts` - Input validation and security checks
  - `src/utils/browserCompat.ts` - Cross-browser compatibility for clipboard/download

### Backend Architecture
- **Traditional Server**: `server/index.js` - Express server with in-memory storage
- **Serverless Functions**: `netlify/functions/` - Netlify Functions for serverless deployment
- **Device Detection**: Uses `ua-parser-js` for platform-specific redirects
- **Short Link Management**: UUID-based short links with multi-platform routing

### QR Code Types Supported
1. **Multi-Platform Links** (`link`) - Different URLs for iOS/Android/Web
2. **App Store Links** (`appstore`) - Direct app store URLs
3. **Custom Short Links** (`qrdylink`) - Branded short URLs
4. **WiFi Networks** (`wifi`) - WiFi credentials with WPA/WEP support
5. **Phone Numbers** (`phone`) - Click-to-call functionality

## Development Commands

### Development
```bash
npm start                    # Start both server and frontend simultaneously (recommended)
npm run dev                  # Start frontend only (port 5173)
npm run server              # Start backend only (port 3001)
```

### Building & Testing
```bash
npm run build               # Build frontend for production
npm test                    # Run comprehensive QR functionality tests
npm run lint                # Run ESLint on codebase
```

### Netlify Development
```bash
npm run netlify:dev         # Start Netlify development environment
npm run netlify:build       # Build for Netlify deployment
npm run netlify:deploy      # Deploy to Netlify
npm run netlify:help        # Show deployment helper script
```

## Testing Strategy

The test suite (`test/test-qr-functionality.js`) provides comprehensive testing:

### Run Single Test
```bash
node test/test-qr-functionality.js     # Run all QR functionality tests
node test/test-frontend-issues.js      # Run frontend-specific tests
```

### Test Coverage Areas
- QR code generation for all supported types
- Device detection and platform-specific redirects
- WiFi QR format validation (WIFI:T:WPA;S:ssid;P:pass;H:false;;)
- Phone number formatting validation (tel:+1234567890)
- URL validation and security checks
- Cross-platform functionality testing
- Server health checks and API endpoint validation

## Key Technical Patterns

### Input Validation & Security
- All user inputs are validated through `src/utils/validation.ts`
- URL validation includes malicious pattern detection and protocol filtering
- WiFi credentials validation for proper SSID/password format
- Phone number validation for international formats
- Input sanitization prevents XSS and command injection

### Cross-Browser Compatibility
- Clipboard operations use modern Clipboard API with `execCommand` fallback
- Download functionality supports canvas `toDataURL` with new window fallback
- Feature detection utilities in `src/utils/browserCompat.ts`
- Network request retry logic with exponential backoff

### State Management
- React state management through custom `useQRGenerator` hook
- Auto-generation QR codes with 500ms debounce on form changes
- Centralized error handling and loading states
- Form validation feedback with real-time validation

### Device Detection & Redirects
- Server-side user agent parsing with `ua-parser-js`
- Platform-specific URL routing (iOS → App Store, Android → Play Store, Desktop → Web)
- Short link generation with UUID-based IDs
- Fallback URL handling for unsupported platforms

## Environment Configuration

### Development (.env)
```bash
NODE_ENV=development
PORT=3001
SERVER_BASE_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:5173
```

### Production (.env.production)
```bash
NODE_ENV=production
SERVER_BASE_URL=https://yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com
```

### Netlify (.env.netlify)
```bash
NODE_ENV=production
VITE_API_BASE_URL=/.netlify/functions
```

## Deployment Options

### Netlify (Recommended)
- Uses `netlify/functions/` for serverless backend
- Frontend builds to `dist/` directory
- Automatic deployment from Git repositories
- Built-in CDN and HTTPS

### Traditional Server
- Uses PM2 with `ecosystem.config.js` configuration
- Nginx reverse proxy configuration in `nginx.conf`
- Manual deployment script in `deploy.sh`
- See `DEPLOYMENT_GUIDE.md` for detailed server setup

## API Endpoints

### Core Endpoints
- `POST /api/generate-qr` - Generate QR code with platform detection
- `GET /r/:shortId` - Multi-platform redirect with device detection
- `GET /q/:shortId` - Simple redirect for branded short links
- `GET /api/links` - List all generated links (admin/debugging)
- `GET /health` - Server health check

### Response Formats
```typescript
// QR Generation Response
{
  qrData: string;      // QR code content or short URL
  shortId?: string;    // Short link identifier (when applicable)
}

// Health Check Response
{
  status: 'healthy',
  timestamp: string,
  environment: string,
  version: string,
  uptime: number
}
```

## Code Modification Guidelines

### Adding New QR Types
1. Update `src/types/qr.ts` to include new type in `QRFormData` interface
2. Add validation logic in `src/utils/validation.ts`
3. Update `QRInputForm.tsx` to handle new form fields
4. Add backend processing in both `server/index.js` and `netlify/functions/generate-qr.js`
5. Add test cases in `test/test-qr-functionality.js`

### Styling & UI
- Uses Tailwind CSS with dark theme and gradient backgrounds
- Responsive design with mobile-first approach
- Loading states with animated spinners
- Error/warning states with colored borders and icons

### Security Considerations
- URL validation prevents malicious protocols (`javascript:`, `data:`, etc.)
- Input sanitization removes HTML/script injection characters
- CORS configuration restricts cross-origin requests
- Rate limiting ready (configurable via environment)

## Browser Support
- Modern browsers: Chrome, Firefox, Safari, Edge
- Mobile responsive design for iOS/Android devices
- Fallback support for clipboard/download operations
- Feature detection prevents errors on unsupported browsers
