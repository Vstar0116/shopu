'use client';

import { useState } from 'react';
import { colors } from '@/lib/uiConfig';

interface Notification {
  id: number;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationsClientProps {
  notifications: Notification[];
  profileId: string;
}

export default function NotificationsClient({ notifications: initialNotifications, profileId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to mark as read');

      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (!res.ok) throw new Error('Failed to mark all as read');

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      order: '🛍️',
      payment: '💳',
      product: '📦',
      review: '⭐',
      system: '⚙️',
    };
    return icons[type] || '📬';
  };

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-sm text-slate-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border-2 p-4 transition-colors ${
                notification.read
                  ? 'border-slate-200 bg-white'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(notification.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Mark as read"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {notification.link && (
                    <a
                      href={notification.link}
                      className={`mt-3 inline-flex items-center gap-2 text-sm font-medium ${colors.primary} hover:underline`}
                    >
                      View Details
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
