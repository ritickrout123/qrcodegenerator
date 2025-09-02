# QR Code Generator Deployment Guide

## Server Information
- **Server IP**: 34.226.228.13
- **Port**: 8000
- **URL**: http://34.226.228.13:8000/

## Quick Deployment Steps

### 1. Connect to Your Server
```bash
ssh your-username@34.226.228.13
```

### 2. Upload Your Project
```bash
# Option A: Using SCP from your local machine
scp -r /path/to/your/project your-username@34.226.228.13:/var/www/qrcodegenerator

# Option B: Using Git (if your code is in a repository)
cd /var/www
sudo git clone https://github.com/yourusername/qrcodegenerator.git
```

### 3. Run the Deployment Script
```bash
cd /var/www/qrcodegenerator
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

### 4. Manual Setup (if you prefer step-by-step)

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
sudo apt install -y nodejs npm nginx

# Install PM2
sudo npm install -g pm2
```

#### Setup Application
```bash
# Navigate to project directory
cd /var/www/qrcodegenerator

# Install dependencies
npm install

# Build the frontend
npm run build

# Copy environment file
cp .env.production .env
```

#### Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/qrcodegenerator

# Enable the site
sudo ln -s /etc/nginx/sites-available/qrcodegenerator /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Start the Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Configure Firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 8000/tcp # Your app port
sudo ufw --force enable
```

## Verification

### Check Services
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View application logs
pm2 logs qrcodegenerator

# View Nginx logs
sudo tail -f /var/log/nginx/qrcodegenerator_*.log
```

### Test Your Application
1. Open browser and go to: http://34.226.228.13:8000/
2. Test QR code generation functionality
3. Check that API endpoints work properly

## Troubleshooting

### Common Issues

#### Port 8000 not accessible
```bash
# Check if port is open
sudo netstat -tlnp | grep :8000

# Check firewall
sudo ufw status

# Open port if needed
sudo ufw allow 8000/tcp
```

#### Application not starting
```bash
# Check PM2 logs
pm2 logs qrcodegenerator

# Restart application
pm2 restart qrcodegenerator

# Check environment variables
pm2 env 0
```

#### Nginx errors
```bash
# Check nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

## Useful Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 restart qrcodegenerator  # Restart app
pm2 stop qrcodegenerator     # Stop app
pm2 logs qrcodegenerator     # View logs
pm2 monit                    # Monitor resources
```

### Nginx Management
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test configuration
sudo nginx -s reload          # Reload configuration
```

### Application Updates
```bash
# Pull latest changes (if using Git)
git pull origin main

# Rebuild frontend
npm run build

# Restart application
pm2 restart qrcodegenerator
```

## Security Recommendations

1. **Setup SSL Certificate** (Let's Encrypt)
2. **Configure proper firewall rules**
3. **Regular security updates**
4. **Monitor application logs**
5. **Backup your data regularly**

## Support

If you encounter issues:
1. Check the logs first
2. Verify all services are running
3. Test network connectivity
4. Review configuration files
