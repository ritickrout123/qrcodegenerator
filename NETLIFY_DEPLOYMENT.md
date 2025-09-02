# Netlify Deployment Guide

This guide will help you deploy the QR Code Generator to Netlify with serverless functions.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Netlify CLI** (optional): `npm install -g netlify-cli`

## Deployment Methods

### Method 1: Git-based Deployment (Recommended)

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your Git provider and select your repository

2. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

3. **Environment Variables**:
   Add these in Netlify Dashboard → Site Settings → Environment Variables:
   ```
   NODE_ENV=production
   VITE_API_BASE_URL=https://YOUR_SITE_NAME.netlify.app/.netlify/functions
   VITE_SERVER_BASE_URL=https://YOUR_SITE_NAME.netlify.app
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Method 2: Manual Deployment

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy with Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist --functions=netlify/functions
   ```

### Method 3: Drag & Drop

1. Build the project locally: `npm run build`
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Drag the `dist` folder to the deployment area
4. Note: This method doesn't support serverless functions

## Configuration Files

The following files are already configured for Netlify:

### `netlify.toml`
- Build settings
- Redirect rules for SPA
- Security headers
- Functions configuration

### Netlify Functions
- `netlify/functions/generate-qr.js` - QR code generation
- `netlify/functions/redirect.js` - Device-specific redirects
- `netlify/functions/health.js` - Health check endpoint

## API Endpoints (After Deployment)

Replace `YOUR_SITE_NAME` with your actual Netlify site name:

- **Generate QR**: `https://YOUR_SITE_NAME.netlify.app/.netlify/functions/generate-qr`
- **Redirect**: `https://YOUR_SITE_NAME.netlify.app/.netlify/functions/redirect?id=SHORTID`
- **Health Check**: `https://YOUR_SITE_NAME.netlify.app/.netlify/functions/health`

## Post-Deployment Steps

1. **Update Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Update `VITE_API_BASE_URL` with your actual site URL
   - Redeploy if needed

2. **Test Functionality**:
   - Visit your deployed site
   - Test QR code generation
   - Test device redirects
   - Check health endpoint

3. **Custom Domain** (Optional):
   - Go to Site Settings → Domain management
   - Add your custom domain
   - Update environment variables with new domain

## Local Development with Netlify

To test Netlify Functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

This will:
- Start the frontend on `http://localhost:8888`
- Run Netlify Functions locally
- Simulate the production environment

## Troubleshooting

### Build Errors
- Check build logs in Netlify Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Function Errors
- Check function logs in Netlify Dashboard → Functions
- Ensure functions are in `netlify/functions/` directory
- Verify function exports are correct

### CORS Issues
- Functions include CORS headers
- Check browser console for errors
- Verify API endpoints are correct

### Environment Variables
- Ensure all required variables are set
- Variables starting with `VITE_` are available in frontend
- Redeploy after changing environment variables

## Performance Optimization

1. **Caching**: Static assets are cached for 1 year
2. **Compression**: Netlify automatically compresses assets
3. **CDN**: Global CDN distribution included
4. **Functions**: Cold start optimization for serverless functions

## Security Features

- Security headers configured in `netlify.toml`
- CORS protection
- Content Security Policy
- XSS protection
- HTTPS enforced

## Monitoring

- **Analytics**: Available in Netlify Dashboard
- **Function Logs**: Real-time function execution logs
- **Build Logs**: Detailed build process logs
- **Performance**: Core Web Vitals tracking

## Cost Considerations

Netlify Free Tier includes:
- 100GB bandwidth/month
- 125,000 function invocations/month
- 100 minutes build time/month

For higher usage, consider upgrading to a paid plan.

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://community.netlify.com)
- [Netlify Support](https://www.netlify.com/support)
