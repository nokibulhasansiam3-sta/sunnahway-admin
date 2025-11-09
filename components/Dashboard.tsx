'use client';

import { useState, useEffect } from 'react';
import { Bell, Users, BarChart3, Send, LogOut, Menu, X, Clock } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import { getScheduledNotifications, type ScheduledNotification } from '@/lib/scheduler';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'users' | 'analytics'>('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  const tabs = [
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    // Load recent notifications from localStorage
    const loadRecent = () => {
      const stored = localStorage.getItem('recentNotifications');
      if (stored) {
        setRecentNotifications(JSON.parse(stored).slice(0, 5)); // Show last 5
      }
    };
    
    loadRecent();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadRecent, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Sunnah Way Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium border border-red-200 hover:border-red-300"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static lg:translate-x-0 z-30 w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)] transition-transform duration-300 shadow-lg lg:shadow-none flex flex-col`}
        >
          {/* Fixed Navigation */}
          <nav className="p-4 space-y-3 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-md transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Notification History */}
          <div className="flex-1 overflow-y-auto p-4 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
              <Clock size={14} />
              Recent Notifications
            </h3>
            <div className="space-y-2">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                      {notif.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(notif.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        notif.target === 'all' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {notif.target === 'all' ? '🌍' : '📱'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">
                  No recent notifications
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'notifications' && <NotificationPanel />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
