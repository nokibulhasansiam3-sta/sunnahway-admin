# 🚀 Vercel Deployment Guide - Step by Step

## ✅ Complete Vercel Setup Instructions

### Step 1: Prepare Your Code

```bash
cd admin-panel
npm install
```

### Step 2: Get Firebase Credentials

#### A. Service Account Key (Admin SDK)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **sunnahway-2024**
3. Click ⚙️ **Settings** → **Project settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file

**Extract these values from the JSON:**
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)

#### B. Web App Config (Client SDK)

1. In Firebase Console, go to **Project Settings** → **General**
2. Scroll to **"Your apps"** section
3. Find or create **Web app** (</> icon)
4. Copy these values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Admin panel ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/sunnahway-admin.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click **"Add New Project"**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `admin-panel` (if repo has multiple folders)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables:**
   Click **"Environment Variables"** and add these:

   ```
   FIREBASE_PROJECT_ID=sunnahway-2024
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sunnahway-2024.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAIlEVTnM69saoUg_emjO1ggs9Laom82rg
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sunnahway-2024.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=sunnahway-2024
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sunnahway-2024.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=751312294276
   NEXT_PUBLIC_FIREBASE_APP_ID=1:751312294276:web:8445a93be7000968378dd1
   ```

   **Important:**
   - Add for **Production**, **Preview**, and **Development**
   - `FIREBASE_PRIVATE_KEY` must include `\n` characters
   - Wrap private key in double quotes

5. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete (2-3 minutes)
   - Your admin panel will be live!

### Step 5: Create Admin User

1. Go to Firebase Console → **Authentication**
2. Click **"Get started"** (if not enabled)
3. Enable **Email/Password** provider
4. Go to **Users** tab
5. Click **"Add user"**
6. Enter email and password
7. This user can now login to admin panel

### Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Login with admin credentials
3. Go to **Notifications** tab
4. Send a test notification:
   - Type: Hadith
   - Title: "টেস্ট নোটিফিকেশন"
   - Content: "এটি একটি টেস্ট নোটিফিকেশন"
   - Send to: All Devices
5. Check your Flutter app - notification should arrive!

## 🔧 Troubleshooting

### Build Fails

**Error: Firebase Admin initialization error**
- Check `FIREBASE_PRIVATE_KEY` has `\n` characters
- Verify all environment variables are set
- Check Vercel build logs for specific errors

**Error: Module not found**
- Run `npm install` locally first
- Check `package.json` has all dependencies

### Login Not Working

- Verify Firebase Authentication is enabled
- Check admin user exists in Firebase Console
- Verify `NEXT_PUBLIC_FIREBASE_*` variables are set correctly

### Notifications Not Sending

- Check Firebase Cloud Messaging is enabled
- Verify service account has proper permissions
- Check Vercel function logs for errors
- Ensure app is subscribed to 'all' topic

### Notifications Not Showing in App

- Verify app is subscribed to 'all' topic
- Check FCM token is registered
- Verify notification format matches app expectations
- Check app logs for notification receipt

## 📱 Testing Notification Flow

1. **Admin Panel:**
   - Login → Notifications tab
   - Fill form → Send

2. **Flutter App:**
   - App should receive notification
   - Tap notification → Opens detail page
   - Content should display correctly

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Admin user created
- [ ] Can login to admin panel
- [ ] Can send test notification
- [ ] Notification arrives in app
- [ ] Notification opens detail page

## 🎉 You're Done!

Your admin panel is now live and ready to use!

**Your Admin Panel URL:** `https://your-project.vercel.app`

---

**Need Help?** Check Vercel logs or Firebase Console for detailed error messages.

