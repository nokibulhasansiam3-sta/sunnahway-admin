import { NextRequest, NextResponse } from 'next/server';
import { messaging } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Handle CORS for API routes
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }
  try {
    const body = await request.json();
    const { type, title, subtitle, body: bodyText, content, imageUrl, target, token } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Prepare notification message - matching Flutter app format exactly
    const notificationData: any = {
      notification: {
        title: `${type === 'article' ? '📝' : type === 'hadith' ? '📖' : '🤲'} ${title}`,
        body: bodyText || subtitle || 'নতুন আপডেট',
      },
      data: {
        type: type,
        title: title,
        body: bodyText || '',
        subtitle: subtitle || '',
        content: content,
        hasDetail: 'true', // Always true for detail page
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...(imageUrl && { imageUrl: imageUrl }),
      },
      android: {
        priority: 'high' as const,
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default',
          channelId: 'high_importance_channel',
          ...(imageUrl && { imageUrl }),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title: `${type === 'article' ? '📝' : type === 'hadith' ? '📖' : '🤲'} ${title}`,
              body: bodyText || subtitle || 'নতুন আপডেট',
            },
          },
        },
        ...(imageUrl && {
          fcm_options: {
            image: imageUrl,
          },
        }),
      },
      webpush: {
        notification: {
          title: `${type === 'article' ? '📝' : type === 'hadith' ? '📖' : '🤲'} ${title}`,
          body: bodyText || subtitle || 'নতুন আপডেট',
          icon: '/icon-192x192.png',
          ...(imageUrl && { image: imageUrl }),
        },
      },
    };

    // Set target (topic or token)
    if (target === 'all') {
      notificationData.topic = 'all';
    } else if (target === 'token' && token) {
      notificationData.token = token;
    } else {
      return NextResponse.json(
        { error: 'Invalid target or missing token' },
        { status: 400 }
      );
    }

    // Send notification
    const response = await messaging.send(notificationData);

    return NextResponse.json(
      {
        success: true,
        messageId: response,
        message: 'Notification sent successfully',
      },
      { headers }
    );
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500, headers }
    );
  }
}

