# Production Deployment & aaPanel Coexistence Guide

This guide details how to deploy the **AttendanceAI** SaaS platform onto an Ubuntu server running aaPanel and an active website **without causing any downtime, interference, or configuration conflicts**.

---

## 1. Coexistence Principles

1. **Never touch existing site vhosts**: aaPanel maintains Nginx configurations under `/www/server/panel/vhost/nginx/`. The new platform uses its own isolated configuration blocks.
2. **Never modify existing databases**: Create a distinct PostgreSQL database and dedicated database user with strict privileges limited only to `attendance_ai_db`.
3. **Dedicated Port Allocations**:
   - API Backend: Port `3041` (internal only, proxied via Nginx)
   - Web Frontend: Port `3042` (internal only, proxied via Nginx)
   - Redis: Standard port `6379` using separate database index (e.g., `db 2` or key namespace `att_ai:*`)
4. **Isolated Directories**:
   - Application root: `/www/wwwroot/attendance-ai/`
   - Uploads/Storage: `/www/wwwroot/attendance-ai/storage/`
   - Application Logs: `/www/wwwroot/attendance-ai/logs/`

---

## 2. PostgreSQL Setup (Isolated Database)

In your terminal or aaPanel PostgreSQL manager:

```bash
# Switch to postgres user
sudo -u postgres psql

# Create dedicated user with strong password
CREATE USER attendance_user WITH PASSWORD 'REPLACE_WITH_STRONG_UNGUESSABLE_PASSWORD';

# Create separate database owned by attendance_user
CREATE DATABASE attendance_ai_db OWNER attendance_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE attendance_ai_db TO attendance_user;

# Enable pgvector extension (for AI memory and embeddings)
\c attendance_ai_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

# Exit
\q
```

---

## 3. Nginx Reverse Proxy Configuration

### A. API Subdomain (`api.yourdomain.com.conf`)

Place this configuration file at `/www/server/panel/vhost/nginx/api.yourdomain.com.conf`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates managed via Let's Encrypt / Certbot / aaPanel
    ssl_certificate /www/server/panel/vhost/cert/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # API Proxy
    location / {
        proxy_pass http://127.0.0.1:3041;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }

    # WebSocket / Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3041/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Protected storage uploads (with authenticated internal redirect)
    location /storage/uploads/ {
        internal;
        alias /www/wwwroot/attendance-ai/storage/uploads/;
    }

    access_log /www/wwwroot/attendance-ai/logs/nginx_api_access.log;
    error_log /www/wwwroot/attendance-ai/logs/nginx_api_error.log;
}
```

### B. Web App Subdomain (`app.yourdomain.com.conf`)

Place this configuration file at `/www/server/panel/vhost/nginx/app.yourdomain.com.conf`:

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /www/server/panel/vhost/cert/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/app.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3042;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /www/wwwroot/attendance-ai/logs/nginx_app_access.log;
    error_log /www/wwwroot/attendance-ai/logs/nginx_app_error.log;
}
```

Test and reload Nginx safely without restarting the entire server:
```bash
nginx -t && nginx -s reload
```

---

## 4. PM2 Process Management

Create `ecosystem.config.js` in `/www/wwwroot/attendance-ai/`:

```javascript
module.exports = {
  apps: [
    {
      name: 'attendance-backend-api',
      script: 'backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3041
      },
      error_file: './logs/pm2_backend_error.log',
      out_file: './logs/pm2_backend_out.log',
      time: true
    },
    {
      name: 'attendance-frontend-web',
      script: 'npx',
      args: 'serve -s frontend/dist -l 3042',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3042
      },
      error_file: './logs/pm2_frontend_error.log',
      out_file: './logs/pm2_frontend_out.log',
      time: true
    }
  ]
};
```

Commands:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 5. Migration and Seed Commands

```bash
cd /www/wwwroot/attendance-ai/backend
npx prisma migrate deploy
npm run seed
```

---

## 6. Backup and Rollback Procedure

- **Database Backup**:
  ```bash
  pg_dump -U attendance_user -d attendance_ai_db -F c -b -v -f /backup/attendance_ai_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Rollback**:
  ```bash
  pm2 stop attendance-backend-api
  pg_restore -U attendance_user -d attendance_ai_db -c -v /backup/attendance_ai_YYYYMMDD_HHMMSS.dump
  pm2 restart attendance-backend-api
  ```
