// Simple notification scheduler using localStorage
export interface ScheduledNotification {
  id: string;
  scheduleDateTime: string; // ISO string
  formData: any;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

export const scheduleNotification = async (formData: any, scheduleDate: string, scheduleTime: string): Promise<string> => {
  // Create date in local timezone
  const [year, month, day] = scheduleDate.split('-').map(Number);
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  
  const scheduleDateTime = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();

  if (scheduleDateTime <= now) {
    throw new Error('Schedule time must be in the future');
  }

  const notification: ScheduledNotification = {
    id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scheduleDateTime: scheduleDateTime.toISOString(),
    formData,
    status: 'pending',
    createdAt: now.toISOString(),
  };

  // Save to localStorage (for UI display)
  const existing = localStorage.getItem('scheduledNotifications');
  const scheduled: ScheduledNotification[] = existing ? JSON.parse(existing) : [];
  scheduled.push(notification);
  localStorage.setItem('scheduledNotifications', JSON.stringify(scheduled));

  // Also save to Firestore (for server-side cron)
  try {
    await fetch('/api/schedule-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });
  } catch (error) {
    console.error('Failed to save to Firestore:', error);
  }

  return notification.id;
};

export const getScheduledNotifications = (): ScheduledNotification[] => {
  const stored = localStorage.getItem('scheduledNotifications');
  return stored ? JSON.parse(stored) : [];
};

export const updateNotificationStatus = (id: string, status: 'sent' | 'failed') => {
  const scheduled = getScheduledNotifications();
  const updated = scheduled.map(n => 
    n.id === id ? { ...n, status } : n
  );
  localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
};

export const checkAndSendScheduledNotifications = async () => {
  const scheduled = getScheduledNotifications();
  const now = new Date();

  console.log(`🔍 Checking scheduled notifications... Found ${scheduled.length} total`);

  for (const notification of scheduled) {
    if (notification.status === 'pending') {
      const scheduleTime = new Date(notification.scheduleDateTime);
      
      console.log(`📅 Notification: ${notification.formData.title}`);
      console.log(`⏰ Scheduled for: ${scheduleTime.toLocaleString()}`);
      console.log(`🕐 Current time: ${now.toLocaleString()}`);
      console.log(`✅ Should send: ${scheduleTime <= now}`);
      
      // Check if it's time to send
      if (scheduleTime <= now) {
        console.log(`🚀 Sending notification: ${notification.formData.title}`);
        
        try {
          // Send the notification
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification.formData),
          });

          if (response.ok) {
            updateNotificationStatus(notification.id, 'sent');
            console.log(`✅ Scheduled notification ${notification.id} sent successfully`);
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Scheduled Notification Sent', {
                body: `"${notification.formData.title}" has been sent successfully!`,
                icon: '/icon.png'
              });
            }
          } else {
            updateNotificationStatus(notification.id, 'failed');
            console.error(`❌ Failed to send scheduled notification ${notification.id}`);
          }
        } catch (error) {
          updateNotificationStatus(notification.id, 'failed');
          console.error(`❌ Error sending scheduled notification ${notification.id}:`, error);
        }
      }
    }
  }
};

// Clean up old notifications (sent/failed older than 7 days)
export const cleanupOldNotifications = () => {
  const scheduled = getScheduledNotifications();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filtered = scheduled.filter(n => {
    if (n.status === 'pending') return true; // Keep all pending
    const createdAt = new Date(n.createdAt);
    return createdAt > sevenDaysAgo; // Keep recent sent/failed
  });

  localStorage.setItem('scheduledNotifications', JSON.stringify(filtered));
};
