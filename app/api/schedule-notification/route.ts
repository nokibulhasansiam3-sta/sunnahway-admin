import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    // Save to Firestore
    await db.collection('scheduledNotifications').doc(notification.id).set({
      ...notification,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Scheduled notification saved to Firestore: ${notification.id}`);

    return NextResponse.json({
      success: true,
      id: notification.id,
      message: 'Notification scheduled successfully',
    });

  } catch (error: any) {
    console.error('❌ Error saving scheduled notification:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
