import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Bell, CheckCircle2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = () => {
    setIsLoading(true);
    api
      .get('/user/notifications')
      .then((data) => setNotifications(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/user/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213A]">System Notifications</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Real-time security alerts, testnet transactions, and protocol milestone notices
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DFE8F5] shadow-card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <Bell className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
            <p className="font-semibold text-[#10213A]">No notifications at this time</p>
            <p>You will receive notices here when security settings change or testnet claims complete.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#DFE8F5]">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-6 flex items-start justify-between gap-4 transition-colors ${
                  item.isRead ? 'bg-white' : 'bg-[#F7FAFF]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.type === 'SUCCESS'
                        ? 'bg-emerald-50 text-[#15803D]'
                        : item.type === 'ALERT'
                        ? 'bg-red-50 text-[#DC2626]'
                        : 'bg-blue-50 text-[#175CFF]'
                    }`}
                  >
                    {item.type === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.type === 'ALERT' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#10213A]">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#175CFF]" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-[#94A3B8] block pt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => markRead(item.id)}
                    className="text-xs font-semibold text-[#175CFF] hover:underline whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
