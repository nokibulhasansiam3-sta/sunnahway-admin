import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // For Vercel deployment, use environment variables
    if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'sunnahway-2024',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // For local development, try service account file
      try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (fileError) {
        // Dummy initialization for build - add env vars in Vercel
        console.warn('No Firebase credentials found. Add environment variables in Vercel.');
      }
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const db = admin.firestore();
export const messaging = admin.messaging();
export const auth = admin.auth();

export default admin;

