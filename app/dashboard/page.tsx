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
            className="bg-white rounded-lg p-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <item.icon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-500">{item.name}</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-lg font-medium text-gray-900">{item.stat}</p>
                  <span className={`ml-2 text-sm font-medium text-green-500`}>
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menús y Categorías */}
        <div className="bg-white rounded-lg">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Menús y Categorías</h3>
              <button className="text-blue-600 hover:text-blue-800">
                + Añadir
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-400">C{i}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Categoría {i}</p>
                      <p className="text-xs text-gray-500">8 productos</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Productos Destacados</h3>
              <button className="text-blue-600 hover:text-blue-800">
                + Añadir
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Producto {i}</p>
                      <p className="text-xs text-gray-500">$19.99</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
