"use client"

/**
 * @fileoverview Componente selector de roles para el sistema de autorización
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona una interfaz para que los usuarios seleccionen
 * su rol activo dentro del sistema. Los roles determinan los permisos y
 * funcionalidades disponibles en la aplicación para cada usuario.
 */

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

/**
 * Componente para seleccionar el rol activo del usuario
 * 
 * Este componente:
 * - Verifica que el usuario haya iniciado sesión
 * - Carga los roles disponibles para el usuario desde la API
 * - Permite seleccionar un rol de la lista desplegable
 * - Selecciona automáticamente el primer rol si no hay uno ya seleccionado
 * - Proporciona un mecanismo para cambiar entre diferentes roles
 * 
 * El componente solo se renderiza cuando existe una sesión de usuario activa.
 * 
 * @returns {JSX.Element | null} Selector de roles o null si no hay sesión
 */
export default function RoleSelector() {
  // Obtener información de la sesión actual
  const { data: session } = useSession()
  
  // Estado para almacenar los roles y el rol seleccionado
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    /**
     * Efecto para cargar los roles disponibles para el usuario
     * 
     * Este efecto:
     * 1. Se ejecuta cuando cambia el objeto de sesión
     * 2. Verifica que exista un usuario autenticado
     * 3. Carga los roles disponibles desde la API
     * 4. Selecciona automáticamente el primer rol si no hay uno ya elegido
     * 5. Maneja y registra errores en la consola
     * 
     * La dependencia [session] asegura que los roles se carguen cuando
     * la información de la sesión esté disponible.
     */
    if (session?.user) {
      fetch('/api/roles')
        .then(res => res.json())
        .then(data => {
          setRoles(data)
          // Si hay roles disponibles, seleccionar el primero por defecto
          if (data.length > 0 && !selectedRole) {
            setSelectedRole(data[0].id)
          }
        })
        .catch(error => console.error('Error cargando roles:', error))
    }
  }, [session])

  /**
   * Maneja el cambio de rol seleccionado
   * 
   * Esta función:
   * 1. Actualiza el estado local con el nuevo rol seleccionado
   * 2. Puede implementarse para persistir la selección (en localStorage, cookies, etc.)
   * 
   * @param {string} roleId - ID del rol seleccionado
   */
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    // Aquí puedes agregar la lógica para guardar el rol seleccionado
    // Por ejemplo, en una cookie o localStorage
  }

  if (!session?.user) return null

  return (
    <div className="w-full">
      <select
        value={selectedRole || ''}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="w-full p-2 border rounded-md bg-white"
      >
        <option value="">Selecciona un rol</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  )
} 