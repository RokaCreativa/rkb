export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt?: Date;
  data?: any;
}

export interface NotificationProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
} 