export type NotificationType = 'RESERVA' | 'SISTEMA' | 'PEDIDO';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
  userId: string;
  data?: Record<string, any>;
} 