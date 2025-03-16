"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function RoleSelector() {
  const { data: session } = useSession()
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
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