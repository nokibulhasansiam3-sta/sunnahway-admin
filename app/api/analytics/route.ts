import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total users
    const listUsersResult = await auth.listUsers();
    const totalUsers = listUsersResult.users.length;

    // Get users with FCM tokens (active users)
    let activeUsers = 0;
    const users = listUsersResult.users;
    
    for (const user of users.slice(0, 100)) { // Limit to first 100 for performance
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data()?.fcmToken) {
          activeUsers++;
        }
      } catch (error) {
        // Skip if user doc doesn't exist
      }
    }

    // Calculate growth rate (simplified - you can enhance this)
    const growthRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Get notifications sent (this would need to be tracked in Firestore)
    // For now, we'll use a placeholder
    const notificationsSent = 0; // You can track this in Firestore

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        notificationsSent,
        growthRate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

