# Centinel - Deployment Guide

Deploy Centinel for free using Railway (backend), Vercel (frontend), and MongoDB Atlas (database).

**Total Cost**: Free (optional ~$15/year for custom domain)

---

## Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account (free at https://www.mongodb.com/cloud/atlas)
- Railway account (free at https://railway.app)
- Vercel account (free at https://vercel.com)
- Google Cloud Console project (optional, for Google Sign-In)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create a Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in (free)
3. Click "Build a Database"
4. Select **M0 FREE** tier
5. Choose a cloud provider and region closest to you
6. Name your cluster (e.g., `centinel-cluster`)
7. Click "Create"

### 1.2 Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Authentication: **Password**
4. Username: `centinel-admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" and **save it**
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 1.3 Allow All IP Addresses

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere**
4. This adds `0.0.0.0/0`
5. Click **Confirm**

### 1.4 Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://centinel-admin:<password>@cluster.mongodb.net/
   ```
6. Replace `<password>` with your database user password
7. Add database name at the end:
   ```
   mongodb+srv://centinel-admin:YourPassword@cluster.mongodb.net/centinel
   ```
8. **Save this string** - you'll need it for Railway

---

## Step 2: Deploy Backend (Railway)

### 2.1 Create Railway Service

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose your repository
6. Railway will detect the project

### 2.2 Configure Root Directory

1. Click on your service (the card that appeared)
2. Go to **Settings** tab
3. Under **Root Directory**, enter: `server`
4. Under **Build Command**, enter: `npm install && npm run build`
5. Under **Start Command**, enter: `npm start`

### 2.3 Add Environment Variables

1. Go to **Variables** tab
2. Click **Add Variable** for each:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string from Step 1.4 |
| `JWT_SECRET` | Generate with command below |
| `CLIENT_URL` | `https://your-app.vercel.app` (update after Step 3) |
| `GOOGLE_CLIENT_ID` | Your Google Client ID (optional) |

**Generate JWT_SECRET** - Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as your JWT_SECRET.

### 2.4 Generate Domain

1. Go to **Settings** tab
2. Scroll to **Networking**
3. Click **Generate Domain**
4. Copy your Railway URL (e.g., `https://rhfinance-production.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel

### 2.5 Deploy

Railway automatically deploys when you add variables. Wait for deployment to complete (check **Deployments** tab).

### 2.6 Test Backend

Visit: `https://your-railway-url.up.railway.app/health`

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **Add New...** → **Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and enter `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 3.2 Add Environment Variables

Before clicking Deploy, expand **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID (optional) |

**Important**: Add `/api` at the end of your Railway URL!

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Copy your Vercel URL (e.g., `https://rhfinance-inky.vercel.app`)

---

## Step 4: Update Railway CORS

Now that you have your Vercel URL, update Railway:

1. Go to Railway dashboard
2. Open your service
3. Go to **Variables** tab
4. Update `CLIENT_URL` to your Vercel URL:
   ```
   https://rhfinance-inky.vercel.app
   ```
5. Railway will automatically redeploy

---

## Step 5: Google OAuth Setup (Optional)

If you want Google Sign-In to work:

### 5.1 Update Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   https://rhfinance-inky.vercel.app
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://rhfinance-inky.vercel.app
   ```
5. Click **Save**

### 5.2 Verify Environment Variables

Make sure both Railway and Vercel have the correct `GOOGLE_CLIENT_ID`:
- Railway: `GOOGLE_CLIENT_ID`
- Vercel: `VITE_GOOGLE_CLIENT_ID`

---

## Step 6: Test Your Deployment

### 6.1 Test Backend Health

Visit: `https://your-railway-url.up.railway.app/health`

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### 6.2 Test Frontend

1. Visit your Vercel URL
2. Open browser DevTools (F12) → Console
3. Check for any red error messages

### 6.3 Test Full Application

1. Try registering a new account
2. Try logging in
3. Create a budget
4. Add a transaction
5. Create a savings pot
6. Test Google Sign-In (if configured)

---

## Troubleshooting

### Backend Not Responding

**Check Railway logs:**
1. Railway dashboard → Your service → **Deployments** tab
2. Click on latest deployment → View logs

**Common issues:**
- Missing environment variables
- Invalid MongoDB connection string
- Build failed

### Frontend Can't Connect to Backend

**Check browser console (F12):**
- CORS errors → Update `CLIENT_URL` in Railway
- Network errors → Verify `VITE_API_URL` in Vercel includes `/api`

**Verify URLs match:**
- Railway `CLIENT_URL` = Your Vercel URL (no trailing slash)
- Vercel `VITE_API_URL` = Your Railway URL + `/api`

### Database Connection Failed

1. Check MongoDB Atlas Network Access has `0.0.0.0/0`
2. Verify password in connection string is correct
3. Ensure `/centinel` is at the end of connection string
4. Check for special characters in password (URL-encode them)

### Google Sign-In Not Working

1. Check authorized origins include your Vercel URL
2. Check redirect URIs include your Vercel URL
3. Verify `GOOGLE_CLIENT_ID` matches in both Railway and Vercel
4. Use HTTPS URLs only (not HTTP)

---

## Updating Your App

When you push changes to GitHub:
- **Railway**: Automatically redeploys backend
- **Vercel**: Automatically redeploys frontend

To manually redeploy:
- **Railway**: Deployments tab → Redeploy
- **Vercel**: Deployments tab → ... → Redeploy

---

## Custom Domain (Optional)

### Vercel Custom Domain

1. Vercel dashboard → Your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS instructions provided by Vercel
4. SSL certificate is automatic

### After Adding Custom Domain

1. Update `CLIENT_URL` in Railway to your custom domain
2. Update Google OAuth authorized origins/URIs
3. Redeploy both services

---

## Cost Summary

| Service | Free Tier Limits |
|---------|------------------|
| MongoDB Atlas | 512 MB storage |
| Railway | $5/month credit (usually enough) |
| Vercel | 100 GB bandwidth/month |

Total: **$0** for portfolio/demo apps

---

## Quick Reference

### Your URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`
- **Health Check**: `https://your-app.up.railway.app/health`

### Environment Variables Checklist

**Railway (Backend):**
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=<64-char-random-string>`
- [ ] `CLIENT_URL=https://your-vercel-url`
- [ ] `GOOGLE_CLIENT_ID=<optional>`

**Vercel (Frontend):**
- [ ] `VITE_API_URL=https://your-railway-url/api`
- [ ] `VITE_GOOGLE_CLIENT_ID=<optional>`

---

Your app is now deployed and ready to share with employers!
