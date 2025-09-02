# QR Code Generator

A modern, cross-platform QR code generator with device detection and multi-platform support.

## Features

- **Cross-Platform QR Codes**: Generate QR codes that automatically redirect users to the correct platform (iOS App Store, Google Play, or web)
- **Multiple QR Types**: Support for URLs, WiFi credentials, phone numbers, app store links, and custom short links
- **Input Validation**: Real-time validation with visual feedback for all input types
- **Browser Compatibility**: Copy and download functionality works across different browsers with fallbacks
- **Device Detection**: Automatic platform detection for iOS, Android, and desktop users
- **Customizable**: Adjustable QR code size, colors, and error correction levels

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
```bash
git clone <repository-url>
cd project
npm install
```

### Running the Application

**Single Command (Recommended):**
```bash
npm start
```
This will start both the server and frontend simultaneously.

**Individual Commands:**
```bash
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Available Scripts

- `npm start` - Run both server and frontend simultaneously
- `npm run dev` - Start the frontend development server
- `npm run server` - Start the backend server
- `npm run build` - Build the frontend for production
- `npm run test` - Run comprehensive functionality tests
- `npm run lint` - Run ESLint

## Environment Configuration

The application supports multiple environments:

### Development (default)
Uses `.env` file with localhost URLs.

### Staging
```bash
cp .env.staging .env
npm start
```

### Production
```bash
cp .env.production .env
# Update URLs in .env.production for your domain
npm start
```

## QR Code Types

1. **Multi-Platform Links**: Different URLs for iOS, Android, and web
2. **App Store Links**: Direct links to iOS App Store
3. **Custom Short Links**: Branded short URLs
4. **WiFi Networks**: WiFi credentials for easy sharing
5. **Phone Numbers**: Click-to-call functionality

## API Endpoints

- `POST /api/generate-qr` - Generate QR code
- `GET /r/:shortId` - Multi-platform redirect
- `GET /q/:shortId` - Simple redirect
- `GET /api/links` - List generated links
- `GET /health` - Health check

## Testing

Run comprehensive tests:
```bash
npm test
```

This will test:
- QR code generation for all types
- Device detection and redirects
- WiFi and phone number formatting
- Cross-platform functionality

## Security Features

- URL validation with malicious pattern detection
- Input sanitization
- CORS protection
- Rate limiting ready (configurable)
- Secure clipboard operations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback support for older browsers
- Mobile-responsive design
- Cross-platform clipboard and download functionality

## Deployment

### Netlify Deployment (Recommended)

**Quick Deploy:**
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository in [Netlify Dashboard](https://app.netlify.com)
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Add environment variables in Netlify Dashboard
5. Deploy!

**Deployment Helper:**
```bash
npm run netlify:help
```

**Local Testing with Netlify:**
```bash
npm install -g netlify-cli
netlify dev
```

📚 **Detailed Guide**: See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

### Other Deployment Options

#### Traditional Server Deployment
Update the following in your production `.env`:
- `SERVER_BASE_URL` - Your server domain
- `VITE_API_BASE_URL` - Your API endpoint
- `CORS_ORIGIN` - Your frontend domain

#### Production Considerations
- Use a database (PostgreSQL/Redis) instead of in-memory storage
- Implement proper logging and monitoring
- Enable HTTPS and security headers
- Set up rate limiting
- Configure link expiration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
