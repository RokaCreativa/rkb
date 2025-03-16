"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'success' | 'warning' | 'info'
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Nuevo menú creado',
      message: 'Se ha creado el menú "Menú de Verano" exitosamente',
      time: 'Hace 5 minutos',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Precio actualizado',
      message: 'El precio del producto "Hamburguesa Especial" ha sido actualizado',
      time: 'Hace 15 minutos',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Alérgeno añadido',
      message: 'Se ha añadido "Gluten" como alérgeno a "Pan de ajo"',
      time: 'Hace 1 hora',
      read: true,
      type: 'warning'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 w-80 rounded-md border bg-white p-4 shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            >
              Marcar todo como leído
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg transition-colors",
                  notification.read ? "bg-gray-50" : "bg-blue-50",
                  "hover:bg-gray-100"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            ))}
          </div>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
} 