# ✅ RokaMenu - Checklist de Validación Funcional Final (`dashboard-v2`)

Este archivo contiene las pruebas clave para validar que la refactorización en `dashboard-v2` mantiene toda la funcionalidad esperada.
Debe completarse antes de avanzar con optimizaciones como code splitting.

---

## 🧪 1. Validación general del flujo
- [ ] El dashboard carga correctamente sin errores.
- [ ] El usuario puede navegar entre categorías, secciones y productos sin reiniciar el estado.
- [ ] La vista móvil (preview) refleja los datos en tiempo real correctamente.

---

## 📂 2. Categorías
- [ ] Crear nueva categoría funciona correctamente.
- [ ] Editar una categoría actualiza el nombre y se refleja en la lista.
- [ ] Eliminar una categoría la elimina de forma inmediata sin romper el estado.
- [ ] Reordenar categorías mediante drag & drop actualiza el orden correctamente.

---

## 📁 3. Secciones
- [ ] Crear sección dentro de una categoría funciona correctamente.
- [ ] Editar sección refleja los cambios en vivo.
- [ ] Eliminar sección no rompe la navegación.
- [ ] Reordenar secciones dentro de una categoría es funcional.

---

## 🍽️ 4. Productos
- [ ] Crear producto dentro de una sección funciona y aparece al instante.
- [ ] Editar producto actualiza nombre, precio e imagen correctamente.
- [ ] Eliminar producto actualiza el listado sin errores.
- [ ] Activar/desactivar visibilidad funciona correctamente (toggle).
- [ ] Reordenar productos dentro de una sección es funcional.

---

## 🖼️ 5. Imágenes
- [ ] Las imágenes se cargan desde rutas correctas (usando getImagePath).
- [ ] Al fallar una imagen, se muestra la imagen de respaldo (handleImageError).

---

## 👥 6. Roles y autenticación
- [ ] Usuarios sin permisos no pueden acceder al dashboard.
- [ ] El control de acceso por roles funciona con el middleware o el hook `useRoleGuard`.

---

## 💾 7. Guardado y sincronización
- [ ] Los cambios en categorías/secciones/productos persisten correctamente en la base de datos.
- [ ] El estado local refleja correctamente los cambios luego del guardado.
- [ ] No hay fugas de estado entre vistas (navegación limpia).

---

## 📦 8. Estructura del código (post-refactor)
- [ ] Todos los modales están en `components/dashboard-v2/modals`.
- [ ] Las vistas principales están en `components/dashboard-v2/views/`.
- [ ] Los hooks están en `dashboard-v2/hooks/` y correctamente organizados por dominio.
- [ ] Tipos están centralizados y usados coherentemente en todo el código.

---

## 🚀 Checklist completado:
- [ ] Listo para aplicar optimizaciones finales (code splitting, preload, etc.).
- [ ] Listo para pasar a testing QA o revisión externa.