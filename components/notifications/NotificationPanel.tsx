"use client"

import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

interface Notification {
  id: number
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: string
}

interface NotificationPanelProps {
  show: boolean
  onClose: () => void
  notifications: Notification[]
}

export default function NotificationPanel({ show, onClose, notifications }: NotificationPanelProps) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform transition ease-in-out duration-500 sm:duration-700"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transform transition ease-in-out duration-500 sm:duration-700"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-full"
    >
      <div className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="bg-blue-600 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">Notificaciones</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="rounded-md bg-blue-600 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={onClose}
                      >
                        <span className="sr-only">Cerrar panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-blue-100">
                      Últimas actualizaciones y alertas
                    </p>
                  </div>
                </div>
                <div className="relative flex-1 px-4 py-6 sm:px-6">
                  {/* Contenido de notificaciones */}
                  <div className="space-y-6">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200"
                      >
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <CheckCircleIcon
                                className={`h-6 w-6 ${
                                  notification.type === 'success'
                                    ? 'text-green-400'
                                    : notification.type === 'error'
                                    ? 'text-red-400'
                                    : notification.type === 'warning'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-gray-400">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
} 