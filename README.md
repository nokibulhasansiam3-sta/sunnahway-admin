# Sunnah Way Admin Panel

একটি সম্পূর্ণ ফ্রি Admin Panel যা Vercel-এ হোস্ট করা যায়। এই panel দিয়ে আপনি:

- 📱 Notification পাঠাতে পারবেন (সব users বা specific device-এ)
- 👥 User management করতে পারবেন
- 📊 Analytics দেখতে পারবেন

## Setup Instructions

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

### 2. Environment Variables

`.env.local` file-এ এই variables গুলো add করুন:

```env
# Firebase Admin SDK (Vercel deployment এর জন্য)
FIREBASE_PROJECT_ID=sunnahway-2024
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# Firebase Client SDK (Authentication এর জন্য)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sunnahway-2024.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sunnahway-2024
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sunnahway-2024.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firebase Service Account Key

Local development এর জন্য, Firebase Console থেকে service account key download করুন:

1. Firebase Console → Project Settings → Service Accounts
2. "Generate new private key" click করুন
3. Download করা JSON file কে `serviceAccountKey.json` নামে `admin-panel` folder-এ রাখুন
4. এই file automatically `.gitignore`-এ আছে

### 4. Run Development Server

```bash
npm run dev
```

Browser-এ `http://localhost:3000` open করুন।

## Vercel Deployment

### 1. GitHub Repository

প্রথমে code টা GitHub-এ push করুন:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Vercel Setup

1. [Vercel](https://vercel.com) এ যান
2. "New Project" click করুন
3. GitHub repository select করুন
4. Environment Variables add করুন (`.env.local` থেকে সব variables)
5. Deploy করুন!

### 3. Important Notes for Vercel

- `FIREBASE_PRIVATE_KEY` variable-এ `\n` characters থাকতে হবে (newlines)
- Vercel automatically Next.js detect করবে
- Build command: `npm run build`
- Output directory: `.next`

## Features

### 📱 Notification Management
- Article, Hadith, বা Dua notification পাঠানো
- সব users বা specific device-এ পাঠানো
- Image support
- Rich content support

### 👥 User Management
- সব users এর list দেখা
- User details (email, name, FCM token)
- Search functionality

### 📊 Analytics
- Total users count
- Active users
- Growth statistics

## Security

- Firebase Authentication দিয়ে login system
- Admin users Firebase Auth-এ manually add করতে হবে
- Service account key secure রাখা হয়েছে

## Support

কোনো সমস্যা হলে:
1. Check করুন environment variables সঠিক আছে কিনা
2. Firebase Console-এ service account permissions check করুন
3. Vercel logs check করুন deployment issues এর জন্য

---

**Made with ❤️ for Sunnah Way**

