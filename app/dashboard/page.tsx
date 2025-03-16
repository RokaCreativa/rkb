"use client"

import { useState } from 'react'
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Visitas Totales', stat: '71,897', icon: EyeIcon, change: '+4.75%', changeType: 'increase' },
  { name: 'Nuevos Clientes', stat: '58', icon: UsersIcon, change: '+2.5%', changeType: 'increase' },
  { name: 'Ventas', stat: '$45,231', icon: ShoppingCartIcon, change: '+54.02%', changeType: 'increase' },
  { name: 'Conversión', stat: '24.57%', icon: ChartBarIcon, change: '+1.39%', changeType: 'increase' }
]

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <div className="flex items-baseline">
                  <p className="text-xl font-semibold text-gray-900">{item.stat}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menús y Categorías */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Menús y Categorías</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                <PlusIcon className="h-4 w-4 mr-1" />
                Añadir
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">C{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Categoría {i}</p>
                      <p className="text-xs text-gray-500">8 productos</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Productos Destacados</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                <PlusIcon className="h-4 w-4 mr-1" />
                Añadir
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Producto {i}</p>
                      <p className="text-xs text-gray-500">$19.99</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
