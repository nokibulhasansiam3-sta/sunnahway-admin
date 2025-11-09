# 🚀 Vercel Deployment Guide

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy
```bash
cd c:\Users\nasim\CascadeProjects\sunahway\admin-panel
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → sunahway-admin (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

## Step 4: Add Environment Variables

After first deployment, go to:
```
https://vercel.com/your-username/sunahway-admin/settings/environment-variables
```

Add these variables from your `.env.local`:

### Firebase Admin SDK:
- `FIREBASE_PROJECT_ID` = sunnahway-2024
- `FIREBASE_PRIVATE_KEY` = (copy from .env.local)
- `FIREBASE_CLIENT_EMAIL` = (copy from .env.local)

### Firebase Client SDK:
- `NEXT_PUBLIC_FIREBASE_API_KEY` = (copy from .env.local)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = (copy from .env.local)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = sunnahway-2024
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = (copy from .env.local)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = (copy from .env.local)
- `NEXT_PUBLIC_FIREBASE_APP_ID` = (copy from .env.local)

### OpenAI (Optional):
- `OPENAI_API_KEY` = (if you want AI features)

## Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 6: Enable Cron Jobs

Cron jobs are automatically enabled in `vercel.json`.
They will run every minute to check scheduled notifications.

## 🎉 Done!

Your admin panel will be live at:
```
https://sunahway-admin.vercel.app
```

## 📝 Important Notes:

1. **Free Plan Limits:**
   - 100 GB bandwidth/month
   - Unlimited projects
   - Automatic HTTPS
   - Cron jobs included!

2. **Scheduled Notifications:**
   - Will work automatically via Vercel Cron
   - Checks every minute
   - No need to keep browser open!

3. **Custom Domain (Optional):**
   - You can add your own domain in Vercel dashboard
   - Free SSL certificate included

## 🔧 Troubleshooting:

If deployment fails:
1. Check all environment variables are set
2. Make sure Firebase credentials are correct
3. Run `vercel logs` to see errors

## 🔄 Update Deployment:

To update after making changes:
```bash
vercel --prod
```

## 📱 Access Your Admin Panel:

After deployment, you can access from anywhere:
- Desktop: https://your-app.vercel.app
- Mobile: Same URL
- Any device with internet!
