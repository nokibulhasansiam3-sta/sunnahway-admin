# 📱 Notification Setup - Complete Guide

## ✅ Notification System Overview

The admin panel sends notifications that are **fully compatible** with your Flutter app. Here's how it works:

### Notification Flow

```
Admin Panel → Firebase Cloud Messaging → Flutter App
     ↓              ↓                        ↓
  Send Form    FCM Service              Receive & Display
```

## 📋 Notification Format

The admin panel sends notifications in this exact format (matching Flutter app):

```json
{
  "notification": {
    "title": "📖 [Your Title]",
    "body": "Preview text"
  },
  "data": {
    "type": "article|hadith|dua",
    "title": "Full title",
    "body": "Body text",
    "subtitle": "Subtitle (optional)",
    "content": "Full content for detail page",
    "hasDetail": "true",
    "imageUrl": "https://..." (optional)
  }
}
```

## 🔧 How It Works in Flutter App

### 1. App Receives Notification

When admin panel sends notification:
- App receives via Firebase Cloud Messaging
- App is subscribed to `all` topic
- Notification shows in system tray

### 2. User Taps Notification

When user taps:
- App extracts data from notification
- Builds route: `/notification-detail?title=...&content=...`
- Navigates to detail page
- Shows full content

### 3. Detail Page Display

The detail page shows:
- Title
- Subtitle (if provided)
- Body text
- Full content
- Image (if provided)

## ✅ Testing Notifications

### From Admin Panel:

1. **Login to admin panel**
2. **Go to Notifications tab**
3. **Fill the form:**
   - Type: Hadith
   - Title: "নামাজের ফজিলত"
   - Subtitle: "রাসূল (সা.)-এর হাদিস"
   - Body: "যে ব্যক্তি ৫ ওয়াক্ত নামাজ আদায় করবে..."
   - Content: "রাসূলুল্লাহ (সা.) বলেছেন: যে ব্যক্তি পাঁচ ওয়াক্ত নামাজ নিয়মিত আদায় করবে..."
   - Image URL: (optional)
   - Send to: All Devices
4. **Click "Send Notification"**
5. **Check your Flutter app** - notification should arrive!

### Expected Behavior:

✅ Notification appears in system tray  
✅ Tap notification → Opens detail page  
✅ Detail page shows full content  
✅ Image displays (if provided)  
✅ Works in foreground, background, and terminated states  

## 🐛 Troubleshooting

### Notification Not Arriving

**Check:**
1. App is subscribed to `all` topic
2. FCM token is registered
3. Firebase Cloud Messaging is enabled
4. App has notification permissions

**Debug:**
```dart
// In Flutter app, check logs:
print('FCM Token: $token');
print('Subscribed to topic: all');
```

### Notification Arrives But No Detail Page

**Check:**
1. `hasDetail` is set to `true` in notification data
2. `content` field is not empty
3. App route `/notification-detail` exists
4. Notification tap handler is working

**Debug:**
```dart
// Check notification data:
print('Notification data: ${message.data}');
print('Has detail: ${message.data['hasDetail']}');
print('Content length: ${message.data['content']?.length}');
```

### Detail Page Not Showing Content

**Check:**
1. Content is properly URL encoded
2. Route parameters are being parsed correctly
3. Detail page component exists and works

## 📝 Notification Types

### Article (📝)
- Type: `article`
- Use for: Islamic articles, stories
- Shows: Full article content

### Hadith (📖)
- Type: `hadith`
- Use for: Hadith sharing
- Shows: Hadith text with reference

### Dua (🤲)
- Type: `dua`
- Use for: Dua sharing
- Shows: Dua text with translation

## 🎨 Best Practices

1. **Title:** Keep it short (50-60 characters)
2. **Body:** Preview text (100-150 characters)
3. **Content:** Full content for detail page (unlimited)
4. **Image:** Use high-quality images (1200x630px recommended)
5. **Timing:** Send during active hours for better engagement

## 🔐 Security

- ✅ Admin panel requires authentication
- ✅ Only authorized users can send notifications
- ✅ Firebase handles secure message delivery
- ✅ App validates notification data

## 📊 Notification Analytics

Track notification performance:
- Total sent
- Delivery rate
- Open rate (when user taps)
- Detail page views

---

**Your notification system is fully integrated and ready to use!** 🎉

