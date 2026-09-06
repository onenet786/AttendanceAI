module.exports = {
  apps: [
    {
      name: 'attendance-api',
      script: 'backend/dist/server.js',
      cwd: './',
      instances: 2, // or 'max'
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      time: true,
    },
    {
      name: 'attendance-frontend',
      script: 'npx',
      args: 'serve -s frontend/dist -l 3000',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      time: true,
    },
  ],
};
