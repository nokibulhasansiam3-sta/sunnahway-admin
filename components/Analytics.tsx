'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Bell, TrendingUp, RefreshCw, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  notificationsSent: number;
  growthRate: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    notificationsSent: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Notifications Sent',
      value: stats.notificationsSent,
      icon: Bell,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: `${stats.growthRate}%`,
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
            <BarChart3 className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time statistics and insights</p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all text-gray-700 font-medium disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-4 rounded-xl shadow-md`}>
                  <Icon className="text-white" size={28} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <Activity size={16} />
                  <span>Live</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">{stat.title}</h3>
              <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Growth Trends
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-sm font-medium text-gray-700">Daily Active Users</span>
              <span className="text-lg font-bold text-blue-600">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-sm font-medium text-gray-700">Growth Rate</span>
              <span className="text-lg font-bold text-green-600">+{stats.growthRate}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="text-purple-600" size={24} />
            Notification Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-sm font-medium text-gray-700">Total Sent</span>
              <span className="text-lg font-bold text-purple-600">{stats.notificationsSent}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-lg font-bold text-green-600">98.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

