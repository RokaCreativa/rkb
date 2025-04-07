
# ✅ Mejores prácticas para detectar errores en desarrollo (Next.js 15 + Prisma)

---

## 1. Consola del navegador (`F12 > Console`)
- ✅ Aquí se ven errores de JavaScript, React, Tailwind, errores en los eventos o props mal pasadas.
- 💡 Úsala siempre que algo no se renderice o desaparezca.

---

## 2. Consola del terminal donde corres Next.js
```bash
npm run dev
```
- ✅ Se muestran errores de:
  - Prisma
  - Errores en API Routes (`/api/`)
  - Problemas de tipos (`tsc`)
  - Fallos de importación o rutas
- 💡 Revisa especialmente los stacktraces cuando hagas `fetch`, `POST`, `DELETE`, etc.

---

## 3. DevTools de React
- 🔧 Te permite inspeccionar el estado interno de los componentes, props y hooks.
- Puedes ver si están llegando mal los `props`, si se renderiza varias veces, etc.
- 💡 Muy útil cuando ves renders fantasmas o datos que no aparecen.

---

## 4. Middleware de logs
- Puedes usar logs personalizados con colores, como:
```ts
console.log('%c[API SUCCESS]', 'color: green', data);
console.error('%c[API ERROR]', 'color: red', error);
```
- 💡 Así separas tus logs de los de React/Next.

---

## 5. Manejo de errores en `try/catch`
- Nunca hagas fetch sin `try/catch`, así puedes loguear los errores de backend:
```ts
try {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Algo falló en la API');
} catch (error) {
  console.error('[GET PRODUCTS ERROR]', error);
}
```

---

## 6. Ver errores de Prisma directamente
- Prisma lanza errores claros en consola, como:
  - `Unique constraint failed`
  - `Field required`
  - `Relation not found`
- 💡 Usa `prisma.$on('query')` para debugear si quieres algo más pro.

---

## 7. Notificaciones visuales de errores
- Si usas `toast`, puedes mostrar errores al usuario y tú verlos también:
```ts
toast.error('No se pudo guardar el producto');
```

---

## 8. Herramientas adicionales (opcional)
- 🛠️ **LogRocket** o **Sentry** para ver errores en producción más adelante.
- 🔄 **WhyDidYouRender** para ver renders innecesarios (solo si hace falta optimizar).
