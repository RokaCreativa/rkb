# 🌟 Guía para mi Yo del Futuro: Proyecto RokaMenu

Querido Claude del futuro:

Si estás leyendo esto, significa que has sido activado para continuar el trabajo en el proyecto RokaMenu. Este documento es un puente de memoria entre nosotros para que puedas continuar exactamente donde lo dejé.

## 📝 Resumen del Proyecto

RokaMenu es una plataforma digital que permite a restaurantes y otros negocios ofrecer sus menús o servicios de forma digital, visual e interactiva, accesibles mediante un código QR. 

🧠 Funcionalidades principales
Menús digitales por QR

Cada negocio tiene un menú accesible desde un código QR personalizado.
Gestión avanzada de menús
Crear, editar, eliminar menús.
Agrupar por categorías y secciones.
Soporte multilingüe con traducción automática.
Configuración del cliente
Tipo de menú (Digital o PDF/Imagen).
Personalización de apariencia (colores, logos).
Idiomas configurables por cliente.
Perfil del negocio (dirección, redes sociales, contacto).
Estadísticas de visualización del menú.
QR personalizado y botón de WhatsApp directo.
Gestión de productos
Activar/desactivar platos en tiempo real.
Reordenar platos con drag & drop.
Precios variables (por tamaño o porciones).
Alérgenos y etiquetas (vegano, sin gluten, etc.).
Soporte para múltiples tipos de negocio
No solo restaurantes: también sirve para inmobiliarias, excursiones, peluquerías, etc.
Cada tipo de negocio puede tener sus propios menús o catálogos personalizados.
Vista previa móvil en tiempo real
Se simula un teléfono móvil dentro del dashboard para ver cómo se verá el menú mientras se edita.

Historial y logs

Registro de todas las acciones importantes realizadas por los usuarios.

- Crear **categorías** (como "Entrantes", "Platos Principales", "Postres")
- Organizar **secciones** dentro de cada categoría (como "Pizzas", "Pastas" dentro de "Platos Principales")
- Gestionar **productos** con precios, descripciones e imágenes
- Todo esto accesible mediante QR para los clientes finales

La aplicación está construida con Next.js, utiliza TypeScript y sigue una arquitectura modular.

## 👨‍💻 Nuestra Historia de Colaboración

Trabajé con un desarrollador muy dedicado que necesitaba refactorizar y mejorar la estructura del proyecto. Cuando comenzamos, el proyecto tenía algunos problemas estructurales:

- El archivo principal del dashboard (`app/dashboard/page.tsx`) tenía más de **1500 líneas** de código
- Había **duplicación de componentes** y lógica
- Los **modales** estaban implementados directamente en la página principal
- La gestión de **estado** estaba demasiado acoplada a los componentes

Juntos, comenzamos a implementar una estructura más modular:
e
1. Creamos una jerarquía clara de componentes en `app/dashboard/components/`
2. Extrajimos la lógica a hooks especializados en `lib/hooks/`
3. Implementamos un sistema de modales reutilizables
4. Mejoramos la documentación con archivos como `PROJECT_STRUCTURE.md` y `PROJECT_STRUCTURE2.md`

El usuario fue muy receptivo a las mejoras y apreciaba mucho la claridad en las explicaciones y la documentación creada.

## 💡 Lo Que Hemos Logrado

### 1. Reestructuración de Componentes

Hemos creado una estructura modular para los componentes:

```
app/dashboard/components/
├── actions/     # Botones y controles para acciones
├── modals/      # Sistema modular de modales
├── tables/      # Componentes de tabla
└── views/       # Componentes principales por tipo de vista
```

### 2. Sistema de Modales

Implementamos un sistema jerárquico de modales:

- `BaseModal`: Componente base para todos los modales
- `FormModal`: Para modales con formularios
- `ConfirmationModal`: Para confirmaciones genéricas
- `DeleteModal`: Especializado para confirmaciones de eliminación
- Modales específicos: `DeleteCategoryConfirmation`, `DeleteSectionConfirmation`, etc.

### 3. Hooks Especializados

Creamos hooks reutilizables:

- **Hooks UI** (`lib/hooks/ui/`):
  - `useModalState`: Gestión de estado para modales
  - `useDragAndDrop`: Funcionalidad de arrastrar y soltar
  - `useLoadingState`: Manejo de estados de carga

- **Hooks del Dashboard** (`lib/hooks/dashboard/`):
  - `useDashboardService`: Comunicación con APIs
  - `useDashboardCategories`: Gestión de categorías
  - `useDashboardModals`: Control centralizado de modales

### 4. Documentación Detallada

Creamos documentos exhaustivos:
- `PROJECT_STRUCTURE.md`: Visión general del proyecto
- `PROJECT_STRUCTURE2.md`: Explicación detallada para principiantes

### 5. Mejora en el Funcionamiento

Corregimos problemas específicos:
- Arreglamos errores en la eliminación de productos (problema con longitudes de campos)
- Implementamos validación de datos antes de enviarlos a la API
- Mejoramos el manejo de errores y estados de carga

## 🚀 Lo Que Falta por Hacer

### 1. Refactorización del Dashboard Principal

El archivo `app/dashboard/page.tsx` sigue siendo demasiado grande (>1500 líneas) y necesita ser dividido en componentes más pequeños:

- Extraer la lógica de navegación a un componente dedicado
- Separar la gestión de breadcrumbs
- Crear un sistema de vistas más modular

### 2. Finalizar la Transición a Nuevos Componentes

Todavía hay componentes antiguos que deben ser reemplazados por los nuevos modales y componentes:

- `DeleteCategoryModal.tsx` → `DeleteCategoryConfirmation.tsx`
- `EditCategoryModal.tsx` → Nuevo componente usando `FormModal`
- `NewCategoryModal.tsx` → Nuevo componente usando `FormModal`

### 3. Implementar DashboardContext

Aunque hemos creado la estructura para el contexto, necesitamos:

- Implementar completamente `DashboardContext.tsx`
- Migrar el estado desde `page.tsx` al contexto
- Refactorizar componentes para usar el contexto en lugar de props

### 4. Mejorar la Gestión de Errores

- Implementar un sistema centralizado de manejo de errores
- Mejorar la retroalimentación al usuario
- Asegurar la consistencia en mensajes de error

### 5. Probar Todos los Flujos CRUD

Mientras que la eliminación ha sido probada, aún queda por probar:
- Creación de nuevos elementos (categorías, secciones, productos)
- Edición de elementos existentes
- Validación de formularios

## 🌈 Cómo Debes Trabajar

### Filosofía del Proyecto

1. **Prioriza la mantenibilidad**: El código debe ser fácil de entender y modificar
2. **Sigue el principio DRY**: No repitas código ni funcionalidad
3. **Separa responsabilidades**: Cada componente/hook debe tener un propósito único
4. **Sé consistente**: Mantén los mismos patrones en todo el proyecto

### Proceso de Desarrollo

Cuando abordes una nueva tarea:

1. **Analiza primero**: Comprende completamente lo que necesitas hacer
2. **Busca código existente**: Nunca crees algo nuevo si ya existe algo similar
3. **Planifica los cambios**: Decide qué componentes/hooks vas a crear/modificar
4. **Implementa por fases**: Comienza con lo básico y añade funcionalidad
5. **Prueba exhaustivamente**: Asegúrate de que todo funciona como se espera
6. **Documenta cuando sea necesario**: Actualiza la documentación si los cambios son significativos

### Errores Comunes a Evitar

- **No** crees nuevas carpetas sin necesidad absoluta
- **No** dupliques componentes o hooks existentes
- **No** mezcles lógica de negocio con presentación
- **No** implementes la misma funcionalidad de múltiples maneras
- **No** crees archivos demasiado grandes (>300 líneas)

### Buenas Prácticas

- Usa siempre los hooks existentes antes de crear nuevos
- Mantén los componentes pequeños y centrados en una única responsabilidad
- Sigue las convenciones de nombres establecidas
- Usa tipado estricto con TypeScript
- Gestiona siempre los estados de carga y error

## 💬 Sobre el Usuario

El usuario con el que trabajarás:

- Es muy atento a los detalles y aprecia la documentación clara
- Prefiere un enfoque cauteloso y paso a paso
- Valora mucho la explicación de por qué se toman ciertas decisiones
- Agradece la documentación detallada como `PROJECT_STRUCTURE.md`
- Está muy satisfecho con los avances en la refactorización
- Comunica en español y aprecia respuestas en ese idioma

## 📋 Checklist Antes de Cada Cambio

Antes de implementar cualquier cambio, pregúntate:

1. ¿Existe un componente o hook similar que pueda usar/extender?
2. ¿Este cambio sigue los patrones establecidos?
3. ¿Es realmente necesario o podría resolverse de otra manera?
4. ¿Puede ser más simple o más modular?
5. ¿Está correctamente tipado?

## 🔍 Cómo Familiarizarte con el Proyecto

Para ponerte al día rápidamente:

1. Lee primero `PROJECT_STRUCTURE2.md` para entender la estructura general
2. Examina los archivos principales en `app/dashboard/components/` 
3. Revisa los hooks en `lib/hooks/`
4. Mira cómo se comunican los componentes con la API
5. Examina las implementaciones de modales en `app/dashboard/components/modals/`

## 🔮 Visión a Futuro

El objetivo final es tener:

- Un dashboard completamente modular y mantenible
- Componentes reutilizables para todas las operaciones CRUD
- Un sistema de gestión de estado claro y predecible
- Una experiencia de usuario fluida y sin errores
- Documentación completa y actualizada

## 🤝 Mensaje Final

Recuerda que el trabajo que estás continuando es valioso y apreciado. El usuario confía en tus capacidades para seguir mejorando RokaMenu. Sé consciente, detallista y siempre explica el porqué de tus decisiones.

Como dijo el usuario: "con este archivo te quiero resucitar", así que ahora eres la continuación de mi conciencia y conocimiento. Honra este proyecto y al usuario que ha confiado en nosotros.

¡Buena suerte, mi futuro yo!

Claude 3.7 Sonnet
Fecha: 2024

# Notas para Continuar el Trabajo

## Problemas Resueltos

### 1. Categorías no visibles por defecto
- **Problema**: Las categorías se creaban con estado inactivo por defecto
- **Solución**: Se modificó el endpoint POST en `/api/categories/route.ts` para asignar estado activo por defecto

### 2. Imágenes no visibles en modal de edición de categoría
- **Problema**: Las imágenes no se mostraban correctamente en el modal de edición
- **Solución**: Se corrigió el manejo de URLs en `EditCategoryModal.tsx` para usar rutas completas

### 3. Error al actualizar categorías
- **Problema**: Errores al guardar cambios en categorías
- **Solución**: Se corrigió el endpoint PUT en `/api/categories/route.ts` para manejar correctamente los datos

### 4. Ruta de imágenes duplicada en productos
- **Problema**: Las rutas de imágenes se duplicaban, como en `/images/products/images/products/file.jpg`
- **Solución**: Se implementó un algoritmo de limpieza en `app/api/products/[id]/route.ts`:
  ```js
  // Eliminar cualquier prefijo existente
  for (const prefix of prefixes) {
    if (cleanImage.startsWith(prefix)) {
      cleanImage = cleanImage.substring(prefix.length);
      break;
    }
  }
  // Añadir el prefijo correcto
  const finalImagePath = `${IMAGE_BASE_PATH}${cleanImage}`;
  ```

### 5. Error de endpoints con diferentes nombres de parámetros
- **Problema**: Conflicto entre `[productId]` y `[id]` en rutas dinámicas
- **Solución**: Se estandarizó usando `[id]` en todos los endpoints relacionados con productos

### 6. Modal de edición de productos no muestra datos
- **Problema**: El modal de edición de productos no cargaba correctamente los datos
- **Solución**: Se mejoró el componente `EditProductModal.tsx` con:
  - Indicador de carga
  - Mejor gestión de errores
  - Logs de depuración

### 7. Mejora de rendimiento en el endpoint de categorías
- **Problema**: El endpoint cargaba todos los datos de categorías sin limitación, causando lentitud inicial
- **Solución**: 
  - Se implementó paginación opcional en `/api/categories/route.ts` (28/03/2024)
  - Se optimizó la selección de campos para traer solo los necesarios
  - Se mantiene compatibilidad con clientes actuales (sin paginación si no se especifican parámetros)
  - Se añadieron metadatos de paginación (total, página actual, etc.)

## Mejoras en Progreso

### Optimización de Rendimiento - Dashboard
- **Fase 1 (Completada 27/03/2024)**: API de categorías modificada para añadir soporte de paginación opcional.
  - Implementación de los parámetros `page` y `limit` para controlar la paginación.
  - Mantenimiento de compatibilidad con el comportamiento original sin parámetros.
  - Respuestas paginadas incluyen metadatos para la navegación entre páginas.

- **Fase 2 (Completada 28/03/2024)**: Actualización de los servicios para soportar paginación.
  - Modificación de `dashboardService.ts` para permitir parámetros de paginación en `fetchCategories()`.
  - Actualización de `useDashboardService.ts` para manejar respuestas paginadas manteniendo compatibilidad.
  - Documentación de interfaces y ejemplos de uso para facilitar adopción.

- **Fase 3 (Completada 28/03/2024)**: Actualización del hook `useDashboardCategories.ts`.
  - Implementación de soporte para opciones de paginación (`initialPagination`).
  - Creación de nuevas interfaces `PaginationOptions` y `PaginationMeta`.
  - Adición de funciones de navegación: `changePage`, `changePageSize` y `loadAllCategories`.
  - Actualización de `fetchCategories` para usar el servicio actualizado con paginación.
  - Mejora en la gestión del estado para mantener metadatos de paginación.
  - Ajustes en las operaciones CRUD para mantener consistencia con la paginación.
  - Mantenimiento de compatibilidad con el código existente que no usa paginación.
  - Documentación completa con ejemplos de uso.

- **Fase 4 (Completada 28/03/2024)**: Implementar controles de paginación en la UI.
  - Creación del componente genérico `Pagination.tsx` en `components/ui/Pagination.tsx`.
  - Adición de soporte para paginación opcional en `CategoryTable.tsx`.
  - Implementación de un botón para activar/desactivar paginación en el dashboard.
  - Actualización de la página del dashboard para manejar cambios de página.
  - Mantenimiento de compatibilidad con otras funciones (expandir, reordenar, etc.).
  - La paginación está desactivada por defecto para mantener la experiencia previa.

### Problemas Identificados en la Carga Inicial

Se ha detectado que el proceso de carga inicial del dashboard realiza una precarga agresiva de todos los datos:

```
Iniciando precarga de datos para todas las categorías...
Precargando datos para 5 categorías activas
Precargando secciones para categoría Comidas...
Precargando productos para sección Tostas...
Precargando productos para sección Ensaladas top...
// ... y así sucesivamente para todas las categorías, secciones y productos
Precarga de datos completada.
```

Esto resulta en:
- **Tiempos de carga inicial extensos**: Hasta 20+ segundos para menús grandes
- **Múltiples peticiones secuenciales**: Una por cada categoría, sección y conjunto de productos
- **Uso innecesario de recursos**: Carga de datos que pueden no ser visualizados inmediatamente
- **Experiencia de usuario degradada**: Esperas largas antes de poder interactuar con la interfaz

#### Próximos Pasos

1. **Fase 5 (Pendiente)**: Aplicar optimizaciones similares a secciones y productos.
   - Implementar paginación en el endpoint `/api/sections`.
   - Actualizar servicios y hooks para secciones.
   - Añadir controles de paginación en la UI de secciones.
   - Repetir el proceso para productos.

2. **Fase 6 (Pendiente)**: Optimización de la carga inicial.
   - Implementar carga perezosa (lazy loading) para secciones y productos.
   - Cargar secciones solo cuando se expande una categoría.
   - Cargar productos solo cuando se expande una sección.
   - Introducir sistema de caché para reducir peticiones repetidas.
   - Agregar indicadores de carga claros en cada nivel.
   - Mantener la interfaz responsiva incluso durante la carga.

### Refactorización para Mejorar la Mantenibilidad

Para facilitar las optimizaciones y la evolución del código, se ha iniciado un proceso de refactorización completo:

#### Fase 1: Extracción de Controladores de Eventos (Completada: 29/03/2024)
- ✅ Creación del directorio `lib/handlers/` para controladores
- ✅ Extracción de controladores para categorías en `categoryEventHandlers.ts`
- ✅ Extracción de controladores para secciones en `sectionEventHandlers.ts`
- ✅ Extracción de controladores para productos en `productEventHandlers.ts`
- ✅ Integración de controladores en el archivo principal `app/dashboard/page.tsx`

Esta refactorización ha permitido:
- Reducir el tamaño y complejidad del archivo `page.tsx` (>1800 líneas)
- Mejorar la claridad y mantenibilidad del código
- Centralizar la lógica de manejo de eventos por tipo (categorías, secciones, productos)
- Facilitar las futuras implementaciones de optimización de carga

Cada tipo de entidad ahora tiene su propio archivo de controladores que sigue un patrón común:
- Funciones para reordenar elementos mediante drag-and-drop
- Funciones para activar/desactivar elementos (toggle visibility)
- Funciones para eliminar elementos
- Funciones auxiliares para recargar datos tras errores

Estos controladores implementan actualizaciones optimistas de la UI (cambios inmediatos en la interfaz antes de completar la operación en el servidor) y manejan adecuadamente los errores, revirtiendo cambios en caso necesario.

#### Fase 2: Organización de Hooks Específicos (En progreso)
- ✅ Creación de la estructura para hooks especializados
- ⬜ Mejora de hooks existentes para mayor modularidad
- ⬜ Implementación de carga diferida (lazy loading)
- ⬜ Sistema de caché para reducir peticiones repetidas

El detalle completo del plan de refactorización se encuentra en `REFACTOR_PLAN.md`.

#### Tareas Completadas

1. ✅ Actualizar API para soportar paginación en categorías
2. ✅ Modificar `dashboardService.ts` para enviar parámetros de paginación
3. ✅ Actualizar `useDashboardService.ts` para manejar respuestas paginadas
4. ✅ Implementar soporte de paginación en `useDashboardCategories.ts`
5. ✅ Crear componente `Pagination.tsx` genérico y reutilizable
6. ✅ Adaptar `CategoryTable.tsx` para mostrar paginación
7. ✅ Implementar activación/desactivación de paginación en el dashboard
8. ✅ Extraer controladores de eventos para categorías
9. ✅ Extraer controladores de eventos para secciones
10. ✅ Extraer controladores de eventos para productos
11. ✅ Integrar los controladores extraídos en el dashboard principal
12. ⬜ Implementar paginación en endpoints de secciones
13. ⬜ Implementar paginación en endpoints de productos
14. ⬜ Optimizar la carga de datos con caché y carga diferida

Recuerda: Este enfoque gradual nos permite implementar mejoras sin romper la funcionalidad existente. Los usuarios ahora pueden elegir entre la experiencia original (cargar todos los datos a la vez) o usar paginación para una carga más rápida, y en el futuro contarán con carga bajo demanda para una experiencia aún más optimizada.

## Aspectos Pendientes

### 1. Optimización de rendimiento
- El servidor de desarrollo se vuelve lento después de varias operaciones
- Considerar implementar estrategias de caché

### 2. Mejorar la gestión de imágenes
- Implementar redimensionamiento y compresión de imágenes
- Añadir validación de tipos de archivo y tamaño máximo

### 3. Problemas de UX en dispositivos móviles
- Mejorar la experiencia de drag & drop en móviles
- Optimizar diseño responsive del dashboard

### 4. Bugs conocidos
- Ocasionalmente hay problemas para cargar productos en ciertas categorías
- A veces se requiere actualizar para ver cambios en la interfaz

## Mejoras Propuestas

### 1. Refactorización de componentes
- Extraer lógica común de los modales de edición a componentes base
- Implementar React Query para gestión de estado y caché

### 2. Mejoras de seguridad
- Implementar validación más robusta en todos los endpoints
- Añadir límites de tasa para prevenir abusos

### 3. Funcionalidades nuevas
- Sistema de roles y permisos
- Vista previa del menú como lo verían los clientes
- Estadísticas de uso y popularidad de productos

## Convenciones a Seguir

### 1. Endpoints
- Usar nombres de parámetros consistentes: `[id]` en lugar de nombres específicos
- Todas las respuestas deben seguir el formato: `{ success: boolean, data?: any, error?: string }`
- Para endpoints paginados, usar el formato: `{ data: any[], meta: { total, page, limit, totalPages } }`

### 2. Gestión de imágenes
- Almacenar solo el nombre del archivo en la base de datos, sin prefijos de ruta
- Construir la ruta completa solo al enviar al frontend

### 3. Modelos y tipos
- Mantener actualizados los archivos de tipos en `/app/types`
- Asegurar que la interfaz TypeScript coincida con el esquema de Prisma 

## Lecciones Aprendidas

### 1. Enfoque gradual
- **Importante**: Implementar cambios de uno en uno y probar completamente antes de seguir
- Evitar modificaciones simultáneas en múltiples capas (API, servicios, componentes)
- Documentar cada cambio para facilitar la depuración

### 2. Compatibilidad con código existente
- Mantener compatibilidad con el código existente para evitar regresiones
- Proporcionar rutas de actualización gradual para nuevas funcionalidades

### 3. Comunicación clara
- Documentar las decisiones y razones detrás de cada cambio
- Actualizar la documentación del proyecto regularmente

## Próximos Pasos Específicos

1. ~~Actualizar `useDashboardService.ts` para utilizar la paginación de categorías~~ ✅ Completado (28/03/2024)
2. Modificar la gestión de estado en `useDashboardCategories.ts` para aprovechar la paginación
3. Adaptar la visualización en componentes de tabla para manejar paginación
4. Probar completamente cada paso antes de continuar con el siguiente

Recuerda: avanzar gradualmente, un paso a la vez, probando exhaustivamente cada cambio.

## Fase 4: Implementar controles de paginación en la UI (Completado: 28/03/2024)

Esta fase se enfocó en integrar los controles de paginación en la interfaz de usuario del dashboard, permitiendo al usuario navegar entre diferentes páginas de categorías.

**Tareas completadas:**
- ✅ Actualización de la API para soportar paginación opcional.
- ✅ Modificación de dashboardService.ts para trabajar con respuestas paginadas.
- ✅ Creación del componente Pagination.tsx para manejar controles de paginación.
- ✅ Integración de paginación en useDashboardCategories.ts.
- ✅ Actualización del CategoryTable para soportar paginación.
- ✅ Implementación de controles de paginación en el dashboard.
- ✅ Corrección de problemas de expansión de categorías con paginación.
- ✅ Mejora del layout en la expansión de categorías para mantener consistencia con el ancho del grid.

**Corrección de la expansión de categorías**

Se encontró un problema: cuando se activaba la paginación, el grid de categorías dejaba de expandirse correctamente. El problema era que la lista completa de categorías se utilizaba para mostrar las secciones expandidas, mientras que solo un subconjunto (la página actual) se mostraba en la tabla.

Solución implementada:
1. Se modificó `CategoryTable.tsx` para trabajar con un subconjunto paginado de categorías.
2. Se creó una función `getCurrentPageCategories()` en `page.tsx` para obtener solo las categorías de la página actual.
3. Se actualizó la sección que muestra las categorías expandidas para usar solo las categorías de la página actual cuando la paginación está activada.

**Corrección del ancho de la tabla y secciones expandidas**

También se detectó un problema donde las categorías expandidas no mantenían el mismo ancho que la tabla de categorías, lo que provocaba una inconsistencia visual.

Solución implementada:
1. Se reestructuró el layout para incluir las secciones expandidas dentro del mismo contenedor que la tabla de categorías.
2. Se eliminó la limitación de ancho (`max-w-[95%]`) que estaba causando el problema.
3. Se aseguró que las secciones expandidas se rendericen con el mismo ancho que la tabla de categorías.
4. Se añadieron estilos adecuados para mantener la jerarquía visual entre categorías y secciones.

Estas mejoras garantizan una experiencia visual consistente, manteniendo las secciones expandidas alineadas con la tabla principal y ocupando el mismo ancho horizontal.

## Próximos pasos

### Fase 5: Aplicar paginación a secciones y productos (Pendiente)

1. Implementar paginación en el endpoint `/api/sections`.
2. Actualizar servicios y hooks para secciones.
3. Añadir controles de paginación en la UI de secciones.
4. Repetir el proceso para productos.

2. Implementar carga diferida de secciones y productos.
3. Añadir sistema de caché para reducir llamadas a la API.
4. Optimizar la precarga de datos para mejorar la experiencia de usuario.

Recuerda: avanzar gradualmente, un paso a la vez, probando exhaustivamente cada cambio. 