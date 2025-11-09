'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Calendar, Smartphone, RefreshCw, Copy, Check } from 'lucide-react';

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  creationTime?: string;
  lastSignInTime?: string;
  fcmToken?: string;
  deviceInfo?: {
    model?: string;
    platform?: string;
    osVersion?: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor app users</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Total Users:</span>
              <span className="text-2xl font-bold text-green-600 ml-2">{users.length}</span>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all text-gray-700 font-medium disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 bg-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">User Info</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Device</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">FCM Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-800">{user.email || 'N/A'}</span>
                          </div>
                          {user.displayName && (
                            <span className="text-xs text-gray-500">{user.displayName}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-blue-500" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">
                            {user.deviceInfo?.model || 'Unknown Device'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.deviceInfo?.platform || 'Android'} {user.deviceInfo?.osVersion || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {user.creationTime
                          ? new Date(user.creationTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.lastSignInTime
                        ? new Date(user.lastSignInTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      {user.fcmToken ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToken(user.fcmToken!)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            {copiedToken === user.fcmToken ? (
                              <>
                                <Check size={14} className="text-green-600" />
                                <span className="text-xs font-semibold text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="text-green-600" />
                                <span className="text-xs font-semibold text-green-600">Copy Token</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500">No Token</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

