"use client";

/**
 * @fileoverview Componente de selección de roles para el dashboard
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente proporciona un menú desplegable para seleccionar roles
 * de usuario en el sistema. Los roles determinan los permisos y acciones
 * disponibles para los usuarios en la plataforma.
 */

import { useState, useEffect } from "react";

/**
 * Interfaz que define la estructura de un rol en el sistema
 * 
 * @property {number} id - Identificador único del rol
 * @property {string} nombre - Nombre descriptivo del rol
 */
interface Role {
  id: number;
  nombre: string;
}

/**
 * Props para el componente RolesDropdown
 * 
 * @property {number | null} selectedRole - ID del rol actualmente seleccionado
 * @property {Function} onSelectRole - Función callback que se ejecuta cuando se selecciona un nuevo rol
 */
interface RolesDropdownProps {
  selectedRole: number | null;
  onSelectRole: (roleId: number) => void;
}

/**
 * Componente de selección de roles mediante un menú desplegable
 * 
 * Este componente:
 * - Carga la lista de roles disponibles desde la API al montarse
 * - Permite al usuario seleccionar un rol de la lista desplegable
 * - Notifica al componente padre cuando se selecciona un nuevo rol
 * - Mantiene seleccionado el rol actual basándose en la prop selectedRole
 * 
 * @param {RolesDropdownProps} props - Propiedades del componente 
 * @returns {JSX.Element} Select con opciones de roles disponibles
 */
export default function RolesDropdown({ selectedRole, onSelectRole }: RolesDropdownProps) {
  // Estado para almacenar los roles obtenidos de la API
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    /**
     * Efecto para cargar la lista de roles desde la API
     * 
     * Este efecto se ejecuta una sola vez al montar el componente y:
     * 1. Realiza una petición a la API de roles
     * 2. Actualiza el estado local con los roles recibidos
     * 3. Captura y registra cualquier error en la consola
     * 
     * La lista de roles se utiliza para poblar las opciones del select.
     */
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Error cargando roles:", error));
  }, []);

  return (
    <select
      className="border rounded p-2 w-full"
      value={selectedRole ?? ""}
      onChange={(e) => onSelectRole(Number(e.target.value))}
    >
      <option value="">Selecciona un rol</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.nombre}
        </option>
      ))}
    </select>
  );
}
