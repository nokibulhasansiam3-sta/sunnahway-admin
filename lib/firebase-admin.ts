import admin from 'firebase-admin';

// Initialize Firebase Admin only if credentials are available
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
    }
  } else {
    console.warn('⚠️ Firebase credentials not found. Add environment variables in Vercel.');
  }
}

export const db = admin.firestore();
export const messaging = admin.messaging();
export const auth = admin.auth();

export default admin;

