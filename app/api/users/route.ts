import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    }));

    // Get FCM tokens from Firestore
    const usersWithTokens = await Promise.all(
      users.map(async (user) => {
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          const userData = userDoc.data();
          return {
            ...user,
            fcmToken: userData?.fcmToken || null,
          };
        } catch (error) {
          return user;
        }
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithTokens,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

