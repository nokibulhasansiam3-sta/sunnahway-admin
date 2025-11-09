'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Check, AlertCircle, Clock, Bell, Upload, X, Image as ImageIcon, Sparkles, Mic } from 'lucide-react';
import { scheduleNotification, checkAndSendScheduledNotifications, cleanupOldNotifications, getScheduledNotifications, type ScheduledNotification } from '@/lib/scheduler';

export default function NotificationPanel() {
  const [formData, setFormData] = useState({
    type: 'article',
    title: '',
    subtitle: '',
    body: '',
    content: '',
    imageUrl: '',
    target: 'all', // 'all' or 'token'
    token: '',
    scheduleType: 'now', // 'now' or 'schedule'
    scheduleDate: new Date().toISOString().split('T')[0], // Today's date
    scheduleTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [showScheduled, setShowScheduled] = useState(false);

  const loadScheduledNotifications = () => {
    const scheduled = getScheduledNotifications();
    setScheduledNotifications(scheduled.filter(n => n.status === 'pending'));
  };

  useEffect(() => {
    // Load recent notifications from localStorage
    const stored = localStorage.getItem('recentNotifications');
    if (stored) {
      setRecentNotifications(JSON.parse(stored));
    }

    // Load scheduled notifications
    loadScheduledNotifications();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start scheduler checker (every 10 seconds)
    const schedulerInterval = setInterval(() => {
      console.log('⏰ Running scheduler check...');
      checkAndSendScheduledNotifications();
      loadScheduledNotifications();
    }, 10000);
    
    // Also check immediately on mount
    checkAndSendScheduledNotifications();

    // Check when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - checking scheduled notifications');
        checkAndSendScheduledNotifications();
        loadScheduledNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup old notifications on mount
    cleanupOldNotifications();

    return () => {
      clearInterval(schedulerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Update image preview when URL changes
    if (formData.imageUrl) {
      setImagePreview(formData.imageUrl);
    } else {
      setImagePreview('');
    }
  }, [formData.imageUrl]);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imageUrl: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImagePreview('');
  };

  const deleteScheduledNotification = (id: string) => {
    const scheduled = getScheduledNotifications();
    const filtered = scheduled.filter(n => n.id !== id);
    localStorage.setItem('scheduledNotifications', JSON.stringify(filtered));
    loadScheduledNotifications();
    setResult({ success: true, message: '🗑️ Scheduled notification deleted' });
  };

  const editScheduledNotification = (notification: ScheduledNotification) => {
    // Load notification data into form
    const scheduleDateTime = new Date(notification.scheduleDateTime);
    
    // Format time properly (HH:MM in 24-hour format)
    const hours = scheduleDateTime.getHours().toString().padStart(2, '0');
    const minutes = scheduleDateTime.getMinutes().toString().padStart(2, '0');
    
    setFormData({
      ...notification.formData,
      scheduleType: 'schedule',
      scheduleDate: scheduleDateTime.toISOString().split('T')[0],
      scheduleTime: `${hours}:${minutes}`,
    });
    
    // Delete the old scheduled notification
    deleteScheduledNotification(notification.id);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowScheduled(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Check if scheduling
      if (formData.scheduleType === 'schedule') {
        if (!formData.scheduleDate || !formData.scheduleTime) {
          setResult({ success: false, message: 'Please select both date and time for scheduling' });
          setLoading(false);
          return;
        }

        // Schedule the notification
        const scheduleId = await scheduleNotification(formData, formData.scheduleDate, formData.scheduleTime);
        
        // Refresh scheduled notifications list
        loadScheduledNotifications();
        
        setResult({ 
          success: true, 
          message: `✅ Notification scheduled for ${formData.scheduleDate} at ${formData.scheduleTime}` 
        });

        // Reset form
        setFormData({
          type: 'article',
          title: '',
          subtitle: '',
          body: '',
          content: '',
          imageUrl: '',
          target: 'all',
          token: '',
          scheduleType: 'now',
          scheduleDate: new Date().toISOString().split('T')[0],
          scheduleTime: '',
        });
        
        setLoading(false);
        return;
      }

      // Send immediately
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: '✅ Notification sent successfully!' });
        
        // Save to recent notifications
        const newNotification = {
          ...formData,
          timestamp: new Date().toISOString(),
          messageId: data.messageId,
        };
        const updated = [newNotification, ...recentNotifications].slice(0, 10);
        setRecentNotifications(updated);
        localStorage.setItem('recentNotifications', JSON.stringify(updated));
        
        // Reset form
        setFormData({
          type: 'article',
          title: '',
          subtitle: '',
          body: '',
          content: '',
          imageUrl: '',
          target: 'all',
          token: '',
          scheduleType: 'now',
          scheduleDate: new Date().toISOString().split('T')[0],
          scheduleTime: '',
        });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send notification' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border-2 border-blue-100 p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
            <Send className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-800">Send Notification</h2>
            <p className="text-gray-500 mt-1">Create and send notifications to your users</p>
          </div>
        </div>

        {result && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              result.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {result.success ? (
              <Check size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{result.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Target - Compact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🎯 Send To
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target: 'all' })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  formData.target === 'all'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🌍</div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${
                      formData.target === 'all' ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      All Users
                    </p>
                  </div>
                  {formData.target === 'all' && (
                    <Check size={18} className="text-blue-600" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, target: 'token' })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  formData.target === 'token'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📱</div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${
                      formData.target === 'token' ? 'text-orange-700' : 'text-gray-800'
                    }`}>
                      Specific Device
                    </p>
                  </div>
                  {formData.target === 'token' && (
                    <Check size={18} className="text-orange-600" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Token Input (if specific device) */}
          {formData.target === 'token' && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-3 border-orange-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Bell className="text-white" size={20} />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-800">
                    📱 FCM Token Required
                  </label>
                  <p className="text-xs text-gray-600">Paste the device token from User Management</p>
                </div>
              </div>
              <input
                type="text"
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-800 bg-white font-mono text-sm"
                placeholder="Enter FCM token (e.g., dXhGT7RqS..."
                required={formData.target === 'token'}
              />
            </div>
          )}

          {/* Schedule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ⏰ Schedule
            </label>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduleType: 'now' })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  formData.scheduleType === 'now'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">⚡</div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${
                      formData.scheduleType === 'now' ? 'text-green-700' : 'text-gray-800'
                    }`}>
                      Send Now
                    </p>
                  </div>
                  {formData.scheduleType === 'now' && (
                    <Check size={18} className="text-green-600" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduleType: 'schedule' })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  formData.scheduleType === 'schedule'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📅</div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${
                      formData.scheduleType === 'schedule' ? 'text-purple-700' : 'text-gray-800'
                    }`}>
                      Schedule Later
                    </p>
                  </div>
                  {formData.scheduleType === 'schedule' && (
                    <Check size={18} className="text-purple-600" />
                  )}
                </div>
              </button>
            </div>

            {/* Schedule Date & Time */}
            {formData.scheduleType === 'schedule' && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white"
                      required={formData.scheduleType === 'schedule'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      ⏰ Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduleTime}
                      onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white"
                      required={formData.scheduleType === 'schedule'}
                    />
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  💡 Notification will be sent on {formData.scheduleDate || 'selected date'} at {formData.scheduleTime || 'selected time'}
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ✏️ Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
              required
              placeholder="Enter notification title"
            />
          </div>

          {/* Subtitle and Body Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subtitle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📌 Subtitle (Optional)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
                placeholder="Enter subtitle"
              />
            </div>

            {/* Body/Preview Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💬 Body/Preview Text (Optional)
              </label>
              <input
                type="text"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
                placeholder="Short preview text for notification"
              />
            </div>
          </div>

          {/* Image Upload - Compact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🖼️ Image (Optional)
            </label>
            
            {/* Image Preview - Smaller */}
            {imagePreview && (
              <div className="mb-3 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border-2 border-blue-300 shadow-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Compact Upload */}
            {!imagePreview && (
              <div className="space-y-3">
                <label className="cursor-pointer block">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                    }`}
                  >
                    <Upload className="text-blue-600 mx-auto mb-2" size={24} />
                    <p className="text-sm font-semibold text-gray-700">Upload Image</p>
                    <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <input
                  type="url"
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
                  placeholder="Paste image URL here..."
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📄 Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white resize-none"
              required
              placeholder="Enter full content (supports multi-line)"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-5 rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Sending Notification...</span>
                </>
              ) : (
                <>
                  <Send size={24} />
                  <span>Send Notification 🚀</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Make sure all information is correct before sending
            </p>
          </div>
        </form>
      </div>

      {/* Scheduled Notifications */}
      {scheduledNotifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 mt-8">
          {/* Warning Message */}
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-bold text-yellow-800 mb-1">⚠️ Important: Keep This Page Open</p>
                <p className="text-yellow-700">
                  Scheduled notifications will only be sent while this admin panel is open in your browser. 
                  The system checks every 10 seconds. You can also use the <strong>&quot;🚀 Send Now&quot;</strong> button to send immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Scheduled Notifications</h3>
                <p className="text-sm text-gray-500 mt-1">{scheduledNotifications.length} pending</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log('🔄 Manual check triggered');
                  checkAndSendScheduledNotifications();
                  loadScheduledNotifications();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold text-sm"
              >
                🔄 Check Now
              </button>
              <button
                type="button"
                onClick={() => setShowScheduled(!showScheduled)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-semibold text-sm"
              >
                {showScheduled ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          {showScheduled && (
            <div className="space-y-3">
              {scheduledNotifications.map((notif) => {
                const scheduleDate = new Date(notif.scheduleDateTime);
                return (
                  <div
                    key={notif.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-purple-600" size={18} />
                          <h4 className="text-lg font-bold text-gray-800">{notif.formData.title}</h4>
                        </div>
                        {notif.formData.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{notif.formData.subtitle}</p>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{notif.formData.content}</p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">
                            📅 {scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">
                            ⏰ {scheduleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                          <span className={`px-2 py-1 rounded font-semibold ${
                            notif.formData.target === 'all'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {notif.formData.target === 'all' ? '🌍 All Users' : '📱 Specific'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Send this notification now?')) {
                              try {
                                const response = await fetch('/api/send-notification', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(notif.formData),
                                });
                                if (response.ok) {
                                  deleteScheduledNotification(notif.id);
                                  setResult({ success: true, message: '✅ Notification sent immediately!' });
                                } else {
                                  setResult({ success: false, message: '❌ Failed to send notification' });
                                }
                              } catch (error) {
                                setResult({ success: false, message: '❌ Error sending notification' });
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs font-semibold"
                        >
                          🚀 Send Now
                        </button>
                        <button
                          type="button"
                          onClick={() => editScheduledNotification(notif)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs font-semibold"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this scheduled notification?')) {
                              deleteScheduledNotification(notif.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Recent Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">Last 10 sent notifications</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentNotifications.map((notif, index) => (
              <div
                key={index}
                className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="text-blue-600" size={20} />
                      <h4 className="text-lg font-bold text-gray-800">{notif.title}</h4>
                    </div>
                    {notif.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">{notif.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">{notif.content}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Clock size={12} />
                      <span>
                        {new Date(notif.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      notif.target === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {notif.target === 'all' ? '🌍 All Users' : '📱 Specific Device'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

