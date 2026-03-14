import { useState } from "react";
import { Bell, X, AlertCircle, TrendingUp, Target, Info, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Goal Progress!',
      message: 'You\'re now 37.5% towards your New Laptop goal! Keep it up! 🐼',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve spent 80% of your Entertainment budget this month.',
      time: '5 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Income Received',
      message: 'Your scholarship payment of $600 has been added.',
      time: '1 day ago',
      read: true
    },
    {
      id: '4',
      type: 'alert',
      title: 'Upcoming Payment',
      message: 'Your bus pass renewal is due in 3 days.',
      time: '1 day ago',
      read: true
    },
    {
      id: '5',
      type: 'success',
      title: 'Money Saved!',
      message: 'Great job! You spent 15% less this month than last month.',
      time: '2 days ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="size-5 text-primary" />;
      case 'warning':
        return <AlertCircle className="size-5 text-orange-500" />;
      case 'info':
        return <Info className="size-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="size-5 text-destructive" />;
      default:
        return <Bell className="size-5" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-primary/10 border-primary/20';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-destructive/10 border-destructive/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-2xl border border-border z-50 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-muted p-2 rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="size-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        getBackgroundColor(notification.type)
                      } ${!notification.read ? 'shadow-sm' : 'opacity-70'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm">
                              {notification.title}
                              {!notification.read && (
                                <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2" />
                              )}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="hover:bg-white/50 p-1 rounded transition-colors"
                            >
                              <X className="size-3 text-muted-foreground" />
                            </button>
                          </div>
                          <p className="text-sm text-foreground/80 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
