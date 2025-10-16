export type AppNotification = {
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'system' | 'project' | 'task' | 'meeting' | 'payment' | 'general';
  actionUrl?: string;
  relatedId?: string;
};

export function emitNotification(notification: AppNotification) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notification', { detail: notification }));
  }
}
