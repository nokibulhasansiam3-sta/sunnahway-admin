# Vercel Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prepare Your Code

```bash
cd admin-panel
npm install
```

### 2. Get Firebase Credentials

#### Firebase Admin SDK (Service Account)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sunnahway-2024**
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file

#### Extract Environment Variables from Service Account JSON

The downloaded JSON file will look like this:
```json
{
  "project_id": "sunnahway-2024",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@sunnahway-2024.iam.gserviceaccount.com",
  ...
}
```

#### Firebase Client SDK (Web App Config)

1. In Firebase Console, go to **Project Settings** → **General**
2. Scroll down to **"Your apps"** section
3. Click on the **Web app** icon (</>) or create one if it doesn't exist
4. Copy the config values

### 3. Set Up GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial admin panel setup"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/sunnahway-admin.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `admin-panel` (if your repo has multiple folders)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

### 5. Add Environment Variables in Vercel

In Vercel project settings, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```
FIREBASE_PROJECT_ID=sunnahway-2024
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sunnahway-2024.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sunnahway-2024.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sunnahway-2024
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sunnahway-2024.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important Notes:**
- `FIREBASE_PRIVATE_KEY` must include the `\n` characters (newlines)
- Wrap the private key in double quotes
- Add these for **Production**, **Preview**, and **Development** environments

### 6. Create Admin User in Firebase

Before you can login, you need to create an admin user:

1. Go to Firebase Console → **Authentication**
2. Click **"Add user"** or **"Users"** tab
3. Click **"Add user"**
4. Enter email and password
5. This user can now login to the admin panel

### 7. Deploy

1. Click **"Deploy"** in Vercel
2. Wait for build to complete
3. Your admin panel will be live at: `https://your-project-name.vercel.app`

### 8. Test the Deployment

1. Visit your Vercel URL
2. Login with the admin credentials you created
3. Try sending a test notification
4. Check the Users and Analytics pages

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify `FIREBASE_PRIVATE_KEY` has proper newlines (`\n`)
- Check Vercel build logs for specific errors

### Authentication Issues

- Verify Firebase Client SDK environment variables are correct
- Check Firebase Authentication is enabled in Firebase Console
- Ensure admin user exists in Firebase Auth

### Notification Sending Fails

- Verify Firebase Admin SDK credentials are correct
- Check Firebase Cloud Messaging is enabled
- Verify service account has proper permissions

### Users Not Showing

- Check Firestore database has user documents
- Verify service account has Firestore read permissions

## Cost

✅ **Completely FREE!**
- Vercel free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions
- Firebase free tier includes:
  - Authentication (50K MAU)
  - Firestore (1GB storage, 50K reads/day)
  - Cloud Messaging (unlimited)

## Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Firebase Console for errors
3. Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**

