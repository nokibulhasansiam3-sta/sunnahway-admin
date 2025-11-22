const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const admin = require('firebase-admin');
const multer = require('multer');

const app = express();
const PORT = 3001; // Admin Panel Port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Configuration ---
const PATHS = {
    stories: path.join(__dirname, '../sunnahway-stories'),
    quiz: path.join(__dirname, '../sunnahway-quiz'),
    // Assuming articles are in the app for now, or a separate repo if exists
    // Adjust this path if you have a separate sunnahway-articles repo
    articles: path.join(__dirname, '../sunnahway-articles')
};

// Firebase Setup
try {
    // Path to service account in the main app folder
    const serviceAccountPath = path.join(__dirname, '../sunnah_way/android/app/sunnahway-2024-firebase-adminsdk-fbsvc-85525ca996.json');

    if (require('fs').existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Initialized");
    } else {
        console.log("⚠️ Firebase Service Account not found at:", serviceAccountPath);
    }
} catch (error) {
    console.error("❌ Firebase Init Error:", error);
}

// --- Authentication ---
const ADMIN_CREDENTIALS = {
    username: 'nokibulhasan',
    password: 'sunnahway@admin24'
};

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        res.json({ success: true, token: 'admin-token-secret' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Auth Middleware
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === 'Bearer admin-token-secret') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- API Endpoints ---

// In-memory storage for scheduled notifications
const scheduledNotifications = [];

// 1. Notification Sender
app.post('/api/notifications/send', requireAuth, async (req, res) => {
    try {
        const { title, body, imageUrl, target, content, writer, sendTime, scheduleDate, scheduleTime } = req.body;

        // If scheduling, store and schedule
        if (sendTime === 'schedule' && scheduleDate && scheduleTime) {
            const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
            const now = new Date();

            if (scheduledFor <= now) {
                return res.status(400).json({ error: 'Scheduled time must be in the future' });
            }

            const notification = {
                id: Date.now(),
                title,
                body,
                imageUrl,
                target,
                content,
                writer,
                scheduledFor: scheduledFor.toISOString(),
                createdAt: now.toISOString()
            };

            scheduledNotifications.push(notification);

            // Schedule the notification
            const delay = scheduledFor - now;
            setTimeout(async () => {
                try {
                    await sendNotificationNow(notification);
                    // Remove from scheduled list
                    const index = scheduledNotifications.findIndex(n => n.id === notification.id);
                    if (index > -1) scheduledNotifications.splice(index, 1);
                } catch (error) {
                    console.error('Error sending scheduled notification:', error);
                }
            }, delay);

            return res.json({
                success: true,
                message: 'Notification scheduled',
                scheduledFor: scheduledFor.toISOString()
            });
        }

        // Send immediately
        const notification = { title, body, imageUrl, target, content, writer };
        const response = await sendNotificationNow(notification);
        res.json({ success: true, response });
    } catch (error) {
        console.error("Notification Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to send notification
async function sendNotificationNow(notification) {
    const { title, body, imageUrl, target, content, writer } = notification;

    const message = {
        notification: { title, body },
        data: {
            type: 'article',
            title,
            subtitle: writer || '',
            body,
            content: content || '',
            writer: writer || '',
            imageUrl: imageUrl || '',
            hasDetail: 'true',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
    };

    // Only add image if URL is provided
    if (imageUrl && imageUrl.trim() !== '') {
        message.android = { notification: { imageUrl } };
        message.apns = {
            payload: { aps: { 'mutable-content': 1 } },
            fcm_options: { image: imageUrl }
        };
    }

    if (target === 'test') {
        message.token = 'YOUR_TEST_DEVICE_TOKEN';
    } else {
        message.topic = 'all';
    }

    return await admin.messaging().send(message);
}

// 2. Quiz Manager
app.get('/api/quiz/categories', requireAuth, async (req, res) => {
    try {
        const filePath = path.join(PATHS.quiz, 'categories.json');
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/quiz/save', requireAuth, async (req, res) => {
    try {
        const { filename, data } = req.body;
        const filePath = path.join(PATHS.quiz, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        // Auto Commit
        // await autoGitCommit(PATHS.quiz, `Update ${filename}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Stories Manager (Placeholder)
app.get('/api/stories/list', requireAuth, async (req, res) => {
    // Implement logic to list story files
    res.json({ message: "Stories list" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Admin Panel running at http://localhost:${PORT}`);
});
