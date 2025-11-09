import { NextRequest, NextResponse } from 'next/server';
import { db, messaging } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Cron job: Checking scheduled notifications...');

    // Get all scheduled notifications from Firestore
    const scheduledRef = db.collection('scheduledNotifications');
    const snapshot = await scheduledRef.where('status', '==', 'pending').get();

    if (snapshot.empty) {
      console.log('📭 No pending scheduled notifications');
      return NextResponse.json({ 
        success: true, 
        message: 'No pending notifications',
        checked: 0 
      });
    }

    const now = new Date();
    let sentCount = 0;
    let failedCount = 0;

    for (const doc of snapshot.docs) {
      const notification = doc.data();
      const scheduleTime = new Date(notification.scheduleDateTime);

      console.log(`📅 Checking: ${notification.formData.title}`);
      console.log(`⏰ Scheduled: ${scheduleTime.toISOString()}`);
      console.log(`🕐 Now: ${now.toISOString()}`);

      // Check if it's time to send
      if (scheduleTime <= now) {
        console.log(`🚀 Sending: ${notification.formData.title}`);

        try {
          // Prepare FCM message
          const message: any = {
            notification: {
              title: notification.formData.title,
              body: notification.formData.body || notification.formData.content.substring(0, 100),
            },
            data: {
              type: notification.formData.type || 'article',
              title: notification.formData.title,
              subtitle: notification.formData.subtitle || '',
              content: notification.formData.content,
              imageUrl: notification.formData.imageUrl || '',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'high_importance_channel',
                priority: 'high',
                sound: 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          };

          // Add image if provided
          if (notification.formData.imageUrl) {
            message.notification.imageUrl = notification.formData.imageUrl;
            message.android.notification.imageUrl = notification.formData.imageUrl;
            message.apns.payload.aps.imageUrl = notification.formData.imageUrl;
          }

          // Send to all or specific token
          if (notification.formData.target === 'all') {
            message.topic = 'all';
          } else if (notification.formData.token) {
            message.token = notification.formData.token;
          }

          // Send the notification
          const response = await messaging.send(message);
          console.log(`✅ Sent successfully: ${response}`);

          // Update status to sent
          await doc.ref.update({
            status: 'sent',
            sentAt: new Date().toISOString(),
            messageId: response,
          });

          sentCount++;
        } catch (error: any) {
          console.error(`❌ Failed to send: ${error.message}`);
          
          // Update status to failed
          await doc.ref.update({
            status: 'failed',
            error: error.message,
            failedAt: new Date().toISOString(),
          });

          failedCount++;
        }
      }
    }

    console.log(`✅ Cron job complete: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      checked: snapshot.size,
      sent: sentCount,
      failed: failedCount,
    });

  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
