module.exports = {
  apps: [{
    name: 'qrcodegenerator',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      SERVER_BASE_URL: 'http://34.226.228.13:8000',
      CORS_ORIGIN: 'http://34.226.228.13:8000'
    },
    error_file: '/var/log/pm2/qrcodegenerator-error.log',
    out_file: '/var/log/pm2/qrcodegenerator-out.log',
    log_file: '/var/log/pm2/qrcodegenerator.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
