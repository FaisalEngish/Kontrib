# Deploying Kontrib to Render.com

This guide will help you deploy your Kontrib application from Replit to Render.com for production use.

## 📋 Prerequisites

- Active Render.com account (free tier available)
- PostgreSQL database on Render (or Neon/Supabase)
- All environment variables from your Replit workspace
- Your Kontrib project downloaded as ZIP from Replit

---

## 🚀 Deployment Steps

### Step 1: Download Project from Replit

1. In your Replit workspace, click the **three dots (⋮)** menu
2. Select **"Download as zip"**
3. Extract the ZIP file on your local machine
4. Optional: Initialize git repository if deploying via GitHub
   ```bash
   cd kontrib
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   ```

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `kontrib-db` (or your preferred name)
   - **Database**: `kontrib` 
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free or Starter
4. Click **"Create Database"**
5. **Save the "Internal Database URL"** - you'll need this for environment variables

### Step 3: Create Web Service on Render

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository:
   - **Option A**: Connect GitHub repository (if you pushed code to GitHub)
   - **Option B**: Upload project manually (use "Deploy from local repository" if available)
3. Configure service:
   - **Name**: `kontrib` (this becomes your URL: kontrib.onrender.com)
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free or Starter

### Step 4: Configure Environment Variables

In your Render Web Service settings, go to **"Environment"** tab and add these variables:

#### Required Database Variables
```bash
DATABASE_URL=<Your Render PostgreSQL Internal URL>
```

#### Authentication & Security
```bash
JWT_SECRET=<Copy from Replit>
SESSION_SECRET=<Copy from Replit>
```

#### WhatsApp Integration (Meta Cloud API)
```bash
WHATSAPP_PHONE_NUMBER_ID=<Copy from Replit>
WHATSAPP_ACCESS_TOKEN=<Copy from Replit>
WHATSAPP_API_VERSION=v21.0
WHATSAPP_VERIFY_TOKEN=<Copy from Replit>
```

#### Node Environment
```bash
NODE_ENV=production
```

#### Optional: Custom Domain Setup
```bash
# If using custom domain (e.g., kontrib.maxtechbd.com)
REPL_SLUG=kontrib
```

### Step 5: Set Up Database Schema

After the first deployment, you need to push your database schema:

1. In Render Dashboard, go to your **Web Service**
2. Click **"Shell"** tab (opens terminal)
3. Run database migration:
   ```bash
   npm run db:push
   ```
4. If you see data-loss warnings, use:
   ```bash
   npm run db:push -- --force
   ```

### Step 6: Custom Domain Setup (Optional)

To use your custom domain `kontrib.maxtechbd.com`:

1. In Render Web Service, go to **"Settings"** tab
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `kontrib.maxtechbd.com`
5. Render will provide DNS records (usually CNAME or A record)
6. Add these records to your domain provider (MaxTech BD):
   ```
   Type: CNAME
   Name: kontrib
   Value: kontrib.onrender.com
   ```
7. Wait for DNS propagation (5-30 minutes)
8. Render will automatically provision SSL certificate

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] **Homepage loads**: Visit `https://kontrib.onrender.com` (or your custom domain)
- [ ] **Database connection**: Check logs for "Connected to database" message
- [ ] **WhatsApp OTP**: Test group registration with OTP verification
- [ ] **Admin dashboard**: Log in and verify stats display correctly
- [ ] **Payment approvals**: Test contribution submission and approval flow
- [ ] **Custom domain**: If configured, test `https://kontrib.maxtechbd.com`

---

## 📊 Monitoring & Logs

### View Application Logs
1. Render Dashboard → Your Web Service
2. Click **"Logs"** tab
3. Monitor real-time logs for errors

### Database Management
1. Render Dashboard → Your PostgreSQL Database
2. Use **"Connect"** tab for psql access
3. Or use external tools like pgAdmin with connection details

---

## 🔄 Continuous Deployment

### Option A: GitHub Auto-Deploy (Recommended)
1. Push your Replit project to GitHub
2. Connect GitHub to Render (done in Step 3)
3. Every push to `main` branch auto-deploys

### Option B: Manual Deploy
1. Make changes in Replit
2. Download as ZIP
3. Update GitHub repository
4. Render auto-deploys on push

---

## 🆘 Troubleshooting

### Build Fails
**Error**: `Cannot find module 'typescript'`
**Fix**: Ensure `typescript` is in `dependencies` (not `devDependencies`)

### Port Binding Error
**Error**: `EADDRINUSE: address already in use`
**Fix**: Render sets `PORT` env var automatically - code already handles this

### Database Connection Fails
**Error**: `Connection refused` or `ECONNREFUSED`
**Fix**: 
1. Verify `DATABASE_URL` is the **Internal Database URL** from Render
2. Ensure database and web service are in the same region
3. Check database is running (Render Dashboard → PostgreSQL)

### WhatsApp OTP Not Sending
**Error**: `WhatsApp API error` in logs
**Fix**:
1. Verify `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are correct
2. Check Meta Business Suite for API quota/limits
3. Ensure phone number format includes country code: `+234...`

### Static Files 404
**Error**: `Cannot GET /assets/index-*.js`
**Fix**: Already handled - build process creates `dist/public/` correctly

---

## 💰 Cost Estimation

### Render Free Tier
- ✅ **Web Service**: Free (spins down after 15 min inactivity)
- ✅ **PostgreSQL**: Free (expires after 90 days, 1GB storage)
- ⚠️ **Limitation**: Slow cold starts (~30s)

### Render Paid Plans
- **Starter Plan**: $7/month (always-on, faster, custom domain with SSL)
- **PostgreSQL**: $7/month (persistent, 10GB storage)

**Recommended for Production**: 
- Web Service: Starter ($7/mo)
- Database: Starter ($7/mo)
- **Total**: ~$14/month

---

## 🔐 Security Best Practices

1. **Rotate Secrets**: Change `JWT_SECRET` and `SESSION_SECRET` for production
2. **Database Backups**: Enable automated backups in Render PostgreSQL settings
3. **Rate Limiting**: Already implemented in code
4. **HTTPS**: Automatic with Render (free SSL)
5. **Environment Variables**: Never commit `.env` file to GitHub

---

## 📞 Support

If deployment fails:
1. Check Render logs (Dashboard → Logs tab)
2. Verify all environment variables are set correctly
3. Ensure database schema is pushed (`npm run db:push`)
4. Contact Render support: https://render.com/support

---

## 🎉 Success!

Once deployed, your Kontrib application will be available at:
- **Render URL**: `https://kontrib.onrender.com`
- **Custom Domain**: `https://kontrib.maxtechbd.com` (if configured)

**Both Replit and Render versions will work independently** - you can continue developing on Replit while production runs on Render! 🚀
