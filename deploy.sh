#!/bin/bash

# QR Code Generator Deployment Script
set -e

echo "🚀 Starting QR Code Generator deployment..."

# Configuration
APP_NAME="qrcodegenerator"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"
SERVICE_NAME="qrcodegenerator"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y nginx nodejs npm git curl

# Install PM2 for process management
print_status "Installing PM2..."
npm install -g pm2

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or copy your application (modify this section based on your deployment method)
print_status "Setting up application files..."
# If deploying from Git:
# git clone https://github.com/yourusername/qrcodegenerator.git .
# 
# If copying from local directory:
# cp -r /path/to/your/project/* .

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build the frontend
print_status "Building frontend..."
npm run build

# Use existing production environment file
print_status "Using existing production environment configuration..."
cp .env.production .env

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/$SERVICE_NAME-error.log',
    out_file: '/var/log/pm2/$SERVICE_NAME-out.log',
    log_file: '/var/log/pm2/$SERVICE_NAME.log',
    time: true
  }]
};
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2

# Copy Nginx configuration
print_status "Setting up Nginx configuration..."
cp nginx.conf $NGINX_CONFIG

# Enable the site
ln -sf $NGINX_CONFIG $NGINX_ENABLED

# Remove default Nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

# Start PM2 application
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Restart Nginx
print_status "Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# Setup firewall (optional)
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_status "✅ Deployment completed successfully!"
print_warning "Don't forget to:"
echo "1. Update your domain name in nginx.conf"
echo "2. Configure SSL certificates"
echo "3. Update CORS_ORIGIN and SERVER_BASE_URL in .env.production"
echo "4. Test your application at http://yourdomain.com"

print_status "Useful commands:"
echo "- Check PM2 status: pm2 status"
echo "- View PM2 logs: pm2 logs $SERVICE_NAME"
echo "- Restart app: pm2 restart $SERVICE_NAME"
echo "- Check Nginx status: systemctl status nginx"
echo "- View Nginx logs: tail -f /var/log/nginx/qrcodegenerator_*.log"
