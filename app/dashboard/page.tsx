"use client";

import RolesDropdown from "./components/RolesDropdown";
import { useState, useEffect } from "react";
import { setCookie } from "cookies-next"; // Importamos para manejar cookies

export default function DashboardPage() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error al obtener los roles:", err));

    const storedRole = localStorage.getItem("selectedRole");
    if (storedRole) {
      setSelectedRole(Number(storedRole));
    }
  }, []);

  useEffect(() => {
    if (selectedRole !== null) {
      localStorage.setItem("selectedRole", String(selectedRole));
      setCookie("role_id", selectedRole, { maxAge: 60 * 60 * 24 }); // Guardamos el rol en las cookies
      const selected = roles.find((role) => role.id === selectedRole);
      setRoleName(selected ? selected.nombre : null);
    }
  }, [selectedRole, roles]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bienvenido al Dashboard</h1>
      <p className="text-gray-600">Aquí podrás gestionar todo el contenido de RokaMenu.</p>

      <div className="mt-4">
        <label className="block text-gray-700 font-medium mb-2">
          Selecciona un rol:
        </label>
        <RolesDropdown selectedRole={selectedRole} onSelectRole={setSelectedRole} />
      </div>

      {selectedRole && (
        <p className="mt-4 text-blue-500">
          Rol seleccionado: <strong>{roleName ? roleName : "Desconocido"}</strong>
        </p>
      )}
    </div>
  );
}
