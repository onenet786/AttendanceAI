# aaPanel UI Deployment Guide: AttendanceAI Platform

This guide is specifically written for your working **Ubuntu Server running aaPanel** with existing websites, existing PostgreSQL, and Node.js.

> [!IMPORTANT]
> **Safety Guarantee for Existing Websites**:
> - We create a **new, separate database** in the aaPanel UI. Your existing databases are completely untouched.
> - We bind **new subdomains** (`api.yourdomain.com` and `app.yourdomain.com`). Your existing websites and virtual hosts are never modified or disrupted.
> - The new backend runs on an isolated internal port (`4000`).

---

## Part 1: Create PostgreSQL Database via aaPanel UI

1. Log in to your **aaPanel Web Dashboard**.
2. In the left navigation menu, click **Database**.
3. Select the **PostgreSQL** tab at the top.
4. Click the blue **Add database** button.
5. Fill in the modal form:
   - **DB name**: `attendance_ai_db`
   - **Username**: `attendance_user` (or let aaPanel generate one)
   - **Password**: Enter or generate a strong password (copy this password!)
   - **Character set**: `utf8`
   - **Access permission**: `Local (127.0.0.1)`
6. Click **Submit**.
7. In the database list, you will now see `attendance_ai_db`.

---

## Part 2: Clone the Project into aaPanel

You can do this using the **Terminal** icon in aaPanel (top right or left menu) or standard SSH:

```bash
cd /www/wwwroot
git clone https://github.com/onenet786/AttendanceAI.git attendance-ai
cd attendance-ai
```

---

## Part 3: Configure `.env` Using aaPanel File Manager

1. In aaPanel, go to **Files** in the left menu.
2. Navigate to: `/www/wwwroot/attendance-ai/backend`
3. If `.env` does not exist yet:
   - Right-click `.env.example` in `/www/wwwroot/attendance-ai` > click **Copy** > paste into `/www/wwwroot/attendance-ai/backend/` and rename it to `.env`.
4. Double-click **`.env`** to open aaPanel's built-in code editor.
5. Update your database connection string and domain URLs:
   ```ini
   NODE_ENV=production
   PORT=4000
   HOST=0.0.0.0

   APP_URL=https://app.yourdomain.com
   API_URL=https://api.yourdomain.com
   CORS_ORIGIN=https://app.yourdomain.com

   # Replace with credentials you created in Part 1:
   DATABASE_URL="postgresql://attendance_user:YOUR_AAPANEL_DB_PASSWORD@127.0.0.1:5432/attendance_ai_db?schema=public"

   # Redis
   REDIS_URL="redis://127.0.0.1:6379/0"

   # JWT Security Secrets (enter 32+ random characters)
   JWT_SECRET="generate_random_secret_string_32_chars_minimum"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_SECRET="generate_another_random_secret_32_chars"
   JWT_REFRESH_EXPIRES_IN="7d"

   STORAGE_PATH="/www/wwwroot/attendance-ai/storage/uploads"
   ```
6. Click **Save** (`Ctrl+S`).

---

## Part 4: One-Click Build & Database Sync

In the aaPanel **Terminal**:

```bash
cd /www/wwwroot/attendance-ai
chmod +x aapanel-setup.sh
./aapanel-setup.sh
```

**What this script automatically does:**
1. Installs backend dependencies and generates Prisma Client.
2. Applies the schema to `attendance_ai_db` without data loss.
3. Compiles the backend TypeScript into `backend/dist/server.js`.
4. Builds the frontend production bundle into `frontend/dist`.
5. Pre-populates demo company, Lahore & Islamabad branches, and 22 staff members.

---

## Part 5: Deploy the Backend API via aaPanel UI

1. In aaPanel left menu, go to **Website** > **Node project** tab.
2. Click **Add Node project**.
3. Fill in the fields:
   - **Project directory**: Select `/www/wwwroot/attendance-ai`
   - **Project name**: `attendance-api`
   - **Run Opt**: Select `start` (or enter `node backend/dist/server.js`)
   - **Port**: `4000`
   - **Node version**: Select your installed Node version (e.g. Node 20 or 22)
   - **Run as**: `www`
   - **Bind domain**: Enter your API subdomain, e.g. `api.yourdomain.com`
4. Click **Submit**.

> **Note**: aaPanel automatically manages the Node process, keeps it running on reboot, and sets up the Nginx reverse proxy to port `4000`!

### Enable WebSockets for Live Attendance:
1. In **Website** > **Node project**, click on `attendance-api` (or click **Config**).
2. Open the **URL rewrite** or **Configuration** (Nginx config) tab and ensure WebSocket headers are included for `/socket.io/`:
   ```nginx
   location /socket.io/ {
       proxy_pass http://127.0.0.1:4000/socket.io/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
   ```
3. Click **Save**.

---

## Part 6: Deploy the Frontend Web App via aaPanel UI

The frontend is already built into static assets inside `/www/wwwroot/attendance-ai/frontend/dist`. This is the fastest, lowest-RAM approach (no Node.js RAM overhead for the frontend):

1. In aaPanel, go to **Website** > **HTML project** (or **PHP/Static project**).
2. Click **Add site**.
3. Fill in:
   - **Domain name**: `app.yourdomain.com`
   - **Root directory**: Set to `/www/wwwroot/attendance-ai/frontend/dist`
   - **PHP version**: `Pure static` (no PHP needed)
4. Click **Submit**.
5. Click on the new site name > Go to **URL rewrite** tab.
6. Paste the Single Page Application (SPA) routing rule so page refreshes work properly:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
7. Click **Save**.

---

## Part 7: Enable One-Click SSL (HTTPS) via aaPanel UI

1. For both `api.yourdomain.com` and `app.yourdomain.com`:
   - Click on the website name in aaPanel.
   - Click the **SSL** tab on the left.
   - Select **Let's Encrypt**.
   - Check your domain and click **Apply**.
   - Toggle **Force HTTPS** to ON.
2. Done!

---

## Part 8: Verification

1. Open your browser and visit:
   - **API Health**: `https://api.yourdomain.com/health` (Returns `"status": "operational"`)
   - **Swagger OpenAPI Docs**: `https://api.yourdomain.com/api/v1/docs`
   - **Web App Dashboard**: `https://app.yourdomain.com`
2. Log in with the pre-seeded admin credentials:
   - **Email**: `admin@democompany.com`
   - **Password**: `Admin@123456`

---

## Updating Later via Git

Whenever you push updates to GitHub, simply open aaPanel **Terminal** and run:

```bash
cd /www/wwwroot/attendance-ai
git pull origin main
./aapanel-setup.sh
```
Then in aaPanel **Website** > **Node project**, click **Restart** on `attendance-api`. That's it!
