**Objetivo:** Navegación drill-down con historial para móvil. Tu `app/roka-menu-mobile-vision/page.tsx` ya implementa esto muy bien. Aquí un extracto conceptual de la lógica de estado e historial:

// MobileViewConcept.tsx
import React, { useState, useCallback } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
// Asume que tienes acceso a tus datos (categories, sections, products) y selectores
// import { useDashboardStore, ... } from './store/dashboardStore';

interface NavItem { id: string; name: string; type: 'category' | 'section' | 'root'; parentId?: string | null; }
// ... (datos de ejemplo o del store)

export function MobileViewConcept() {
const [history, setHistory] = useState<NavItem[]>([]); // Pila de historial
const [currentItem, setCurrentItem] = useState<NavItem>({ id: 'root', name: 'Menú Principal', type: 'root' });

// Función para obtener hijos del ítem actual (simplificada)
const getChildrenOf = (item: NavItem): NavItem[] => {
// Lógica para buscar en categories, sections, products según item.id y item.type
// Ejemplo: if (item.type === 'root') return categories.map(c => ({...c, type: 'category'}));
// if (item.type === 'category') return sectionsForCategory(item.id).map(s => ({...s, type: 'section'}));
return []; // Placeholder
};

const children = getChildrenOf(currentItem);

const navigateTo = useCallback((item: NavItem) => {
if (item.type === 'product') {
// Abrir editor de producto o similar
alert(`Abrir editor para: ${item.name}`);
return;
}
setHistory(prev => [...prev, currentItem]);
setCurrentItem(item);
}, [currentItem]);

const goBack = useCallback(() => {
if (history.length === 0) return;
const previousItem = history[history.length - 1];
setCurrentItem(previousItem);
setHistory(prev => prev.slice(0, -1));
}, [history]);

// Para transiciones, Framer Motion es una excelente opción.
// Envuelve la lista de ítems con <motion.div> y anima `initial`, `animate`, `exit`.

return (

<div>
<header className="p-4 border-b flex items-center">
{history.length > 0 ? (
<button onClick={goBack} className="mr-2"><ChevronLeft size={24} /></button>
) : (
<Home size={24} className="mr-2 text-gray-400" />
)}
<h1 className="text-xl font-semibold">{currentItem.name}</h1>
</header>
<main>
{/_ Aquí renderizarías la lista de 'children' _/}
{/_ Cada ítem de la lista llamaría a navigateTo(childItem) onClick _/}
{/_ Ejemplo: <div onClick={() => navigateTo(child)}>{child.name}</div> _/}
</main>
</div>
);
}
**Transiciones Suaves:**

- Usa `framer-motion` y su componente `AnimatePresence` para animar la entrada y salida de las listas de ítems cuando `currentItem` cambia.

```jsx
// import { motion, AnimatePresence } from 'framer-motion';
// `<AnimatePresence mode="wait">`
//   <motion.ul
//     key={currentItem.id} // Clave importante para AnimatePresence
//     initial={{ opacity: 0, x: history.length > previousHistoryLength ? 100 : -100 }}
//     animate={{ opacity: 1, x: 0 }}
//     exit={{ opacity: 0, x: history.length < previousHistoryLength ? 100 : -100 }}
//     transition={{ duration: 0.2 }}
//   >
//     {/* ...items de la lista... */}
//   </motion.ul>
// `</AnimatePresence>`
```

(Necesitarías guardar `previousHistoryLength` para determinar la dirección de la animación).
