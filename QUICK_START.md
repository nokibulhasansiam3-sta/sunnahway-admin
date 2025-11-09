# Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file:

```env
# Copy from .env.example and fill in your values
FIREBASE_PROJECT_ID=sunnahway-2024
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sunnahway-2024.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sunnahway-2024
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sunnahway-2024.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Admin User

1. Go to Firebase Console → Authentication
2. Add a user with email and password
3. Use these credentials to login

### 5. Start Managing!

- 📱 Send notifications
- 👥 View users
- 📊 Check analytics

## 📦 For Production (Vercel)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

---

**That's it! You're ready to go! 🎉**

