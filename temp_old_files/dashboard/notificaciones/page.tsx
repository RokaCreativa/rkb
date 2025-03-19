"use client";

import { useState, useEffect } from "react";
import { Notification } from "@/app/types/notification";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, Check, Trash2, AlertCircle, Plus, CheckCircle2 } from "lucide-react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

export default function NotificacionesPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "no-leidas">("todas");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Error al obtener notificaciones");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Error al marcar como leída");

      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
      
      if (!response.ok) throw new Error("Error al eliminar notificación");
      
      setNotifications(notifications.filter((notif) => notif.id !== notificationId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Error al marcar todas como leídas");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Configurar WebSocket
    if (session?.user?.id) {
      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000');
      
      socket.on('connect', () => {
        console.log('Conectado al servidor de WebSocket');
        socket.emit('join', session.user.id);
      });

      socket.on('newNotification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      socket.on('notificationDeleted', (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      });

      socket.on('notificationRead', (notificationId: string) => {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session?.user?.id]);

  const filteredNotifications = notifications.filter((notif) =>
    filter === "no-leidas" ? !notif.read : true
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "RESERVA":
        return "🗓️";
      case "PEDIDO":
        return "🛍️";
      case "SISTEMA":
        return "⚙️";
      default:
        return "📢";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500">Cargando notificaciones...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-4 animate-pulse rounded-lg border bg-white p-4"
          >
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500">
            {notifications.length} notificaciones en total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Marcar todas como leídas</span>
            </button>
          )}
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/test-notification', {
                  method: 'POST',
                });
                if (!response.ok) throw new Error('Error al crear notificación');
                await fetchNotifications();
              } catch (error) {
                console.error('Error:', error);
              }
            }}
            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
            title="Crear notificación de prueba"
          >
            <Plus className="h-5 w-5" />
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "todas" | "no-leidas")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="todas">Todas</option>
            <option value="no-leidas">No leídas</option>
          </select>
          <button
            onClick={() => fetchNotifications()}
            className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            title="Actualizar"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 md:p-8 text-center">
          <Bell className="mx-auto h-10 md:h-12 w-10 md:w-12 text-gray-400" />
          <h3 className="mt-4 text-base md:text-lg font-medium text-gray-900">
            No hay notificaciones
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === "no-leidas"
              ? "No tienes notificaciones sin leer"
              : "No tienes notificaciones"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border bg-white p-3 md:p-4 transition-colors ${
                !notification.read ? "border-blue-100 bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <span className="text-xl md:text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div>
                    <p className="text-sm text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 md:space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Marcar como leída"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {deleteConfirm === notification.id ? (
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(notification.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación - Ahora más responsivo */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 md:p-6 shadow-lg">
            <div className="mb-4 flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 md:h-6 w-5 md:w-6" />
              <h3 className="text-base md:text-lg font-medium">Confirmar eliminación</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border px-3 md:px-4 py-1.5 md:py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const notificationId = deleteConfirm;
                  deleteNotification(notificationId);
                }}
                className="rounded-lg bg-red-600 px-3 md:px-4 py-1.5 md:py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 