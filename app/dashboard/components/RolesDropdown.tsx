"use client";

import { useState, useEffect } from "react";

interface Role {
  id: number;
  nombre: string;
}

interface RolesDropdownProps {
  selectedRole: number | null;
  onSelectRole: (roleId: number) => void;
}

export default function RolesDropdown({ selectedRole, onSelectRole }: RolesDropdownProps) {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    // Fetch de roles desde la API
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
