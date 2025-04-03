# Los Mandamientos de la Refactorización 📜

> "No tocarás el código original, ni harás daño a la funcionalidad existente"

## 🎯 Objetivo Principal
- **NO TOCARÁS** el dashboard original
- Refactorizar = Reorganizar código existente
- Mantener EXACTAMENTE la misma funcionalidad
- Aplicar patrones modernos SIN sobre-ingenierizar
- Implementar arquitectura limpia
- **PROHIBIDO USAR COMPONENTES DEL DASHBOARD ORIGINAL**
  * Si necesitas un componente similar, cópialo y adáptalo en dashboard-v2
  * Mantén total separación entre las dos implementaciones
  * No mezclar importaciones entre dashboard y dashboard-v2

## 🚫 MANDAMIENTO SUPREMO: RESPETARÁS LA REFACTORIZACIÓN REALIZADA
- **NUNCA volverás a mezclar responsabilidades que han sido separadas**
- Honrarás la estructura de carpetas establecida:
  * Modales en `dashboard-v2/components/modals/`
  * Componentes de vista en `dashboard-v2/components/views/`
  * Hooks específicos en `dashboard-v2/hooks/`
  * Tipos en `dashboard-v2/types/`
  * Utilidades en `dashboard-v2/utils/`
- Preservarás la separación de responsabilidades:
  * Hooks por dominio: useCategoryManagement, useSectionManagement, useProductManagement
  * useDashboardState como fachada para coordinar los hooks de dominio
  * Componentes visuales solo para renderizado y eventos
- Mantendrás la documentación actualizada
- Conservarás las optimizaciones implementadas:
  * Virtualización para listas largas
  * Lazy loading para carga de datos
  * Memoización en componentes pesados
  * Utilidades de rendimiento (debounce, throttle, cache)
- **TODA NUEVA FUNCIONALIDAD** debe seguir los mismos patrones establecidos
- Consultarás los archivos de documentación antes de hacer cambios:
  * `docs/dashboard-v2-modelo-datos.md`
  * `docs/dashboard-v2-optimizaciones.md`
  * `RokaMenu_Refactor_Checklist_dashboard-v2.md`

## 📚 Buenas Prácticas de Programación
- Implementar principios SOLID
- Separación clara de responsabilidades
- Sistema de manejo de estado eficiente
- Manejo de errores robusto
- Testing sistemático (unitario y de integración)

## 🛠️ Enfoque Técnico
- TypeScript implementado correctamente
- Componentes pequeños y focalizados
- Patrones de diseño adecuados
- Testing desde el inicio
- Manejo de estado predecible

## 📝 Documentación y Mantenimiento
- Documentar SOLO código probado y funcionando
- Archivos a mantener actualizados:
  * `dashboard-v2-refactoring-guide.md`
  * `dashboard-v2-refactoring-guide-part2.md`
  * `dashboard-v2-refactoring-guide-part3.md`
  * `dashboard-v2-refactoring-index.md`
  * `docs/dashboard-v2-modelo-datos.md`
  * `docs/dashboard-v2-optimizaciones.md`
  * `RokaMenu_Refactor_Checklist_dashboard-v2.md`
- Comentarios claros "para dummies"
- Documentar decisiones de arquitectura

## ✅ Verificación Constante
- Tests para cada componente
- Comparar comportamiento con original
- Verificar rendimiento
- NO avanzar si algo no funciona igual

## 📖 MANDAMIENTO CRÍTICO: Estudio del Código Original
- **SIEMPRE CONSULTARÁS el código del dashboard original antes de implementar cualquier componente**
- Este mandamiento es PRIORITARIO y no puede ser ignorado bajo ninguna circunstancia
- Entender a fondo el código original ANTES de refactorizar cualquier parte
- Comparar visual y funcionalmente cada componente con su equivalente original
- Analizar meticulosamente los patrones de interacción y comportamientos específicos
- Revisar los estilos exactos (márgenes, espaciados, colores, tipografía) para asegurar fidelidad visual
- Documentar diferencias estructurales pero mantener la experiencia de usuario IDÉNTICA
- NUNCA asumir cómo funciona algo - verificar siempre en el código original
- En caso de duda, SIEMPRE consultar el código original como fuente de verdad absoluta

## 📱 MANDAMIENTO CRÍTICO: Flujo de Navegación y Comportamiento de Vistas
- **RESPETAR EXACTAMENTE el flujo de navegación del dashboard original**
- Estudiar meticulosamente cómo se manejan los cambios entre vistas en el dashboard original
- Mantener el mismo comportamiento cuando se hace clic en categorías, secciones y productos
- Preservar el estado de navegación (expandido/colapsado) según el diseño original
- Asegurar que las transiciones entre vistas sean idénticas al dashboard original
- Estudiar los métodos `navigateToCategory`, `navigateToSection` y similares en el código original
- NO implementar cambios en el flujo de navegación sin primero verificar el comportamiento original
- Respetar la jerarquía de navegación: Categorías -> Secciones -> Productos
- Mantener la coherencia entre el breadcrumb y la vista actual
- Garantizar que el comportamiento de "volver atrás" funcione exactamente igual que en el original
- **CRUCIAL**: Mostrar las secciones expandidas dentro de la vista de categorías, NO navegar a una vista separada
- Las secciones DEBEN aparecer como elementos expandidos bajo la categoría correspondiente, manteniendo la vista de categorías

## 🧠 MANDAMIENTO CRÍTICO: Gestión del Estado
- **IMPLEMENTARÁS un sistema de doble estado (local y global) para datos críticos**
- Usar estado local para respuesta inmediata en la interfaz de usuario
- Mantener estado global para coordinación entre componentes
- Implementar verificación de cache para evitar cargas redundantes
- Normalizar datos antes de almacenarlos en cualquier estado
- Priorizar el estado local sobre el global para renderizado cuando sea necesario
- Incluir indicadores visuales específicos durante estados de carga
- Implementar herramientas de depuración visibles en modo desarrollo
- Evitar efectos con dependencias innecesarias o mal configuradas
- Utilizar nombres descriptivos para los estados que indiquen su propósito específico

## 🔄 MANDAMIENTO CRÍTICO: Patrón de Actualización Inmediata
- **APLICARÁS el mismo patrón de actualización UI en todos los niveles jerárquicos**
- Implementar actualización directa del objeto original antes de llamar a callbacks (`objeto.propiedad = nuevoValor`)
- Mantener consistencia entre implementaciones de categorías, secciones y productos
- Cuando una implementación funciona correctamente, analizar y replicar el mismo patrón
- Evitar soluciones complejas cuando un enfoque simple ya ha demostrado funcionar
- Para forzar re-renders, usar el patrón de nueva referencia de array (`[...arrayExistente]`)
- Documentar claramente los patrones de actualización para mantener consistencia
- Verificar que cada nivel de la jerarquía (categoría → sección → producto) siga el mismo patrón
- Implementar actualización optimista de la UI antes de recibir respuesta del servidor
- Considerar estados intermedios para indicar procesamiento durante la actualización

## 🔍 MANDAMIENTO CRÍTICO: Modelo de Tipos y Transparencia de Datos
- **HONRARÁS la estructura de tipos centralizada**
- Todos los tipos e interfaces se definirán SOLO en `dashboard-v2/types/`
- Todo nuevo tipo o interfaz deberá seguir el patrón de nomenclatura existente
- No se duplicarán definiciones de tipos existentes
- Se mantendrá sincronización estricta entre los tipos y las respuestas reales de la API
- Cualquier extensión de tipos DEBE ser compatible con el modelo de datos actual
- Las interfaces de componentes seguirán la nomenclatura `ComponentNameProps`
- Se usarán enumeraciones o tipos union para valores limitados (ej: ViewType)
- Los tipos relacionados se agruparán en archivos lógicos dentro del directorio de tipos
- Las propiedades opcionales se marcarán explícitamente con `?`
- Se documentará el propósito de cada nueva interfaz o tipo añadido
- **RESPETARÁS la estructura jerárquica definida en docs/dashboard-v2-modelo-datos.md**:
  * Cliente → Categoría → Sección → Producto
  * Las relaciones entre entidades deben mantenerse consistentes
  * Los estados específicos por dominio (CategoryState, SectionState, ProductState) 
    deben utilizarse apropiadamente
  * Los identificadores de tipo deben ser consistentes (category_id, section_id, product_id)
  * Los tipos de vista (ViewType) e interacción (InteractionMode) deben usarse según su definición

## 📊 MANDAMIENTO CRÍTICO: Optimización de Rendimiento
- **PRESERVARÁS todas las optimizaciones implementadas**
- Utilizarás virtualización para listas largas (VirtualizedList) según docs/dashboard-v2-optimizaciones.md
- Implementarás lazy loading de datos cuando sea apropiado (useLazyLoading)
- Aplicarás debounce a eventos frecuentes (input, scroll)
- Utilizarás throttle para limitar la frecuencia de operaciones costosas
- Implementarás memoización con React.memo para componentes puros
- Utilizarás useCallback para funciones pasadas como props
- Aprovecharás useMemo para cálculos costosos
- Utilizarás la caché en memoria para datos frecuentemente accedidos
- Minimizarás re-renders innecesarios
- Implementarás code splitting para componentes grandes
- **SEGUIRÁS la estructura de optimizaciones documentada**:
  * useVirtualizedList para listas largas
  * useLazyLoading para carga diferida de datos
  * VirtualizedList para componentes de lista
  * OptimizedCategoryView para visualización de categorías
  * Utilidades de performance.ts para debounce, throttle y cache

## 🗂️ MANDAMIENTO CRÍTICO: Estructura de Archivos del Dashboard V2
- **RESPETARÁS la estructura de archivos establecida**
- Todos los modales deben estar en `dashboard-v2/components/modals/`
- Todos los componentes de vista deben estar en `dashboard-v2/components/views/`
- Todos los hooks de dominio deben estar en `dashboard-v2/hooks/`
- Todos los tipos deben estar en `dashboard-v2/types/`
- Todas las utilidades deben estar en `dashboard-v2/utils/`
- Toda la documentación específica de Dashboard V2 debe estar en `docs/dashboard-v2-*.md`
- El esquema de nombrado de archivos debe ser consistente y descriptivo
- Cada archivo debe tener una responsabilidad única y clara
- Los componentes UI reutilizables deben estar en `dashboard-v2/components/ui/`
- Las importaciones deben ser organizadas: primero React, luego dependencias externas, componentes propios y finalmente estilos

## 🔒 MANDAMIENTO CRÍTICO: Validación de Acceso
- **IMPLEMENTARÁS verificación de roles en cada punto de entrada**
- Mantener redirecciones a /unauthorized cuando un usuario no tenga permisos
- Validar roles tanto en el cliente como en el servidor
- Mantener consistencia en los mensajes de error de acceso
- Documentar claramente los requisitos de acceso para cada sección
- Implementar pruebas de acceso para cada rol
- Asegurar que la redirección sea inmediata y clara
- Proporcionar retroalimentación específica sobre los permisos faltantes
- Mantener actualizados los requisitos de acceso según evolucione la aplicación
- Verificar periódicamente que las restricciones de acceso funcionen correctamente

## 🚀 Escalabilidad Real
- Arquitectura que permita crecimiento
- Código modular y reutilizable
- Patrones consistentes
- Fácil de extender sin modificar

## 📋 Plan de Acción Detallado

### Fase 1: Arquitectura Base 🏗️
1. **Implementar arquitectura limpia con:**
   - `features/` - Características principales
   - `shared/` - Componentes y utilidades compartidas
   - `core/` - Lógica de negocio central
   - `infrastructure/` - Servicios externos y APIs

2. **Migrar el estado global:**
   - Reemplazar `DashboardContext` con un sistema más robusto
   - Implementar un store centralizado con Zustand
   - Separar la lógica de negocio de los componentes

### Fase 2: Componentes Base 🧩
1. **Crear componentes base reutilizables:**
   - Tablas genéricas
   - Modales base
   - Formularios
   - Botones y controles

2. **Implementar sistema de diseño:**
   - Variables de tema
   - Componentes UI consistentes
   - Sistema de espaciado y tipografía

### Fase 3: Features Principales 🎯
1. **Migrar features una por una:**
   - Gestión de Categorías
   - Gestión de Secciones
   - Gestión de Productos
   - Vista previa del teléfono

2. **Cada feature incluirá:**
   - Componentes específicos
   - Hooks personalizados
   - Tests unitarios
   - Documentación

### Fase 4: Testing y Optimización 🚀
1. **Implementar tests:**
   - Unitarios para componentes
   - De integración para features
   - Tests de rendimiento

2. **Optimizaciones:**
   - Lazy loading de componentes
   - Memoización donde sea necesario
   - Optimización de re-renders

### Fase 5: Documentación y Validación 📝
1. **Documentar:**
   - Guías de uso
   - Decisiones de arquitectura
   - Patrones implementados

2. **Validar:**
   - Comparación con dashboard original
   - Tests de integración
   - Revisión de rendimiento

## 📚 Comprensión de RokaMenu

### 🎯 Propósito Principal
- Plataforma de menús digitales para restaurantes
- Acceso mediante códigos QR
- Gestión completa de menús (categorías, secciones, productos)

### 🏗️ Estructura de Datos
1. **Categorías** (ej: Entrantes, Platos Principales)
   - Atributos: ID, nombre, orden, estado
   - Contiene: Múltiples secciones
   
2. **Secciones** (ej: Pastas, Carnes)
   - Atributos: ID, nombre, imagen, orden, estado
   - Pertenece a: Una categoría
   - Contiene: Múltiples productos

3. **Productos** (ej: Spaghetti Carbonara)
   - Atributos: ID, nombre, descripción, precio, imagen
   - Pertenece a: Una sección
   - Estado: activo/inactivo

### 🔄 Flujos Principales
1. **Dashboard**
   - Gestión CRUD de categorías
   - Gestión CRUD de secciones por categoría
   - Gestión CRUD de productos por sección
   - Vista previa en tiempo real
   - **Seguir exactamente el flujo de datos documentado en docs/dashboard-v2-modelo-datos.md**
     * Carga inicial → Mostrar categorías → Seleccionar categoría → Cargar secciones → 
       Seleccionar sección → Cargar productos
     * Las acciones de creación, edición, eliminación y visibilidad deben reflejarse
       inmediatamente en la UI siguiendo el patrón de actualización inmediata

2. **Vista Pública**
   - Acceso mediante QR
   - Navegación jerárquica
   - Visualización optimizada para móviles

### ⚠️ Puntos Críticos
1. **Rendimiento**
   - Carga inicial optimizada (<2s)
   - Carga progresiva de datos
   - Gestión eficiente del estado

2. **Consistencia de Datos**
   - Tipos booleanos vs numéricos
   - Estados de visibilidad
   - Orden de elementos

3. **UX/UI**
   - Feedback inmediato
   - Estados de carga claros
   - Prevención de errores

## 🔍 Recordatorios Importantes

1. **NO modificar el dashboard original**
   - Todo desarrollo nuevo en dashboard-v2
   - Mantener compatibilidad con datos existentes

2. **Priorizar rendimiento**
   - Implementar carga progresiva
   - Evitar carga innecesaria de datos
   - Optimizar re-renders

3. **Mantener consistencia**
   - Seguir patrones establecidos
   - Usar tipos definidos
   - Documentar cambios

4. **Testing y validación**
   - Probar cada cambio
   - Validar tipos
   - Verificar rendimiento

5. **Gestión de imágenes**
   - Usar sólo rutas estandarizadas:
     * Logo de Roka Menu: `/images/logo_rokamenu.png`
     * Categorías: `/images/categories/{nombre_archivo}`
     * Secciones: `/images/sections/{nombre_archivo}`
     * Productos: `/images/products/{nombre_archivo}`
     * Logo principal: `/images/main_logo/{nombre_archivo}`
     * Imagen de respaldo: `/images/no-image.png`
   - Utilizar siempre `getImagePath()` para resolver rutas
   - Implementar `handleImageError()` para manejo de errores
   - NO usar rutas antiguas como `/images/clientes/`

6. **Modelo de datos principal**
   - **clients**:
     * client_id: Int [@id]
     * name: String? [@db.VarChar(100)]
     * company_logo: String? [@db.VarChar(70)] Este de momento creo que no se usa
     * main_logo: String? [@db.VarChar(100)]
     * email: String [@db.VarChar(200)]
   - **categories**:
     * category_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(50)]
     * image: String? [@db.VarChar(45)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
     * client_id: Int?
   - **sections**:
     * section_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(50)]
     * image: String? [@db.VarChar(100)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
     * category_id: Int?
   - **products**:
     * product_id: Int [@id @default(autoincrement())]
     * name: String? [@db.VarChar(100)]
     * description: String? [@db.Text]
     * price: Decimal? [@db.Decimal(10, 2)]
     * image: String? [@db.VarChar(100)]
     * status: Boolean? [@default(true)]
     * display_order: Int?
   - **products_sections**:
     * product_id: Int [parte de clave primaria compuesta]
     * section_id: Int [parte de clave primaria compuesta]
   - **users** (auth):
     * user_id: String [@id @db.VarChar(30)]
     * email: String [@db.VarChar(255)] /* Principalmente usado para autenticación */
     * password: String? [@db.VarChar(30)] /* Principalmente usado para autenticación */
     * username: String? [@db.VarChar(200)] /* Usado para gestión de sesión */
     * profile: String? [@db.VarChar(2)] /* Usado para gestión de sesión */
     * client_id: Int? /* Usado para gestión de sesión */

## ⚠️ RECORDATORIO CRÍTICO:
- RESPETAR la estructura y arquitectura implementada en la refactorización
- MANTENER la separación de responsabilidades entre componentes y hooks
- PRESERVAR todas las optimizaciones de rendimiento implementadas
- SEGUIR los patrones establecidos para cualquier nueva funcionalidad
- CONSULTAR la documentación antes de hacer cambios
- ASEGURAR la consistencia en los tipos y interfaces
- VERIFICAR los mandamientos antes de cada modificación
- PRESERVAR la estructura jerárquica de datos (Cliente → Categoría → Sección → Producto)
- UTILIZAR los hooks de dominio específicos para cada tipo de entidad
- IMPLEMENTAR virtualización para cualquier lista que pueda crecer significativamente
- MANTENER la coherencia entre estados locales y globales para actualizaciones inmediatas
- APLICAR debounce y throttle para eventos de alta frecuencia
- UTILIZAR memoización (useMemo, useCallback, React.memo) de manera estratégica

---

> 🎯 **Estado Actual**: Fase 7 - Revisión Final (En Progreso)
> 
> 📅 **Última Actualización**: 13/06/2024 - 19:45 - v1.0.0
> 
> ✅ **Completado**:
> - Estructura de directorios creada
> - Tipos base definidos
> - Tipos normalizados y consolidados en un archivo centralizado
> - Modales extraídos a componentes individuales
> - Componentes visuales por dominio implementados:
>   * CategoryView para gestión de categorías
>   * SectionView para gestión de secciones
>   * ProductView para gestión de productos
>   * MobilePreview para visualización en formato móvil
>   * Breadcrumbs para navegación entre vistas
> - Hooks de dominio implementados:
>   * useCategoryManagement para categorías
>   * useSectionManagement para secciones
>   * useProductManagement para productos
>   * useDashboardState como fachada de coordinación
> - Limpieza de page.tsx:
>   * Metadatos adecuados
>   * Validación de roles
>   * Renderizado de DashboardView
> - Optimizaciones de rendimiento:
>   * Virtualización para listas largas (VirtualizedList)
>   * Carga diferida de datos (useLazyLoading)
>   * Componente OptimizedCategoryView
>   * Utilidades de rendimiento (debounce, throttle, cache)
> - Validación de acceso:
>   * Página de unauthorized implementada
>   * Verificación de roles en page.tsx
> - Documentación completa:
>   * Modelo de datos documentado (docs/dashboard-v2-modelo-datos.md)
>   * Optimizaciones documentadas (docs/dashboard-v2-optimizaciones.md)
>   * Checklist de refactorización actualizado
> 
> 🔄 **Próximos Pasos**:
> - Finalizar pruebas de acceso por rol
> - Implementar code splitting para reducir el tamaño del bundle inicial
> 
> ⚠️ **RECORDATORIO CRÍTICO**:
> - RESPETAR la estructura y arquitectura implementada en la refactorización
> - MANTENER la separación de responsabilidades entre componentes y hooks
> - PRESERVAR todas las optimizaciones de rendimiento implementadas
> - SEGUIR los patrones establecidos para cualquier nueva funcionalidad
> - CONSULTAR la documentación antes de hacer cambios
> - ASEGURAR la consistencia en los tipos y interfaces
> - VERIFICAR los mandamientos antes de cada modificación
> - PRESERVAR la estructura jerárquica de datos (Cliente → Categoría → Sección → Producto)
> - UTILIZAR los hooks de dominio específicos para cada tipo de entidad
> - IMPLEMENTAR virtualización para cualquier lista que pueda crecer significativamente
> - MANTENER la coherencia entre estados locales y globales para actualizaciones inmediatas
> - APLICAR debounce y throttle para eventos de alta frecuencia
> - UTILIZAR memoización (useMemo, useCallback, React.memo) de manera estratégica
>
> 📋 **Progreso General**: 95% completado
> 
> 📝 **Notas**:
> - La refactorización ha resultado en una mejora significativa de la organización y mantenibilidad del código
> - La separación en componentes por dominio ha facilitado la comprensión y el mantenimiento
> - Los hooks de dominio han permitido una separación clara de responsabilidades
> - Las optimizaciones de rendimiento han mejorado significativamente la experiencia de usuario
> - La documentación completa facilita la comprensión del código y su arquitectura
> - La estructura modular permite añadir nuevas funcionalidades de manera más sencilla
> - La validación de roles mejora la seguridad de la aplicación
> - Las utilidades de rendimiento permiten una experiencia fluida incluso con grandes volúmenes de datos
> - La estructura de tipos normalizada facilita la verificación de tipos y previene errores

> 💡 **Nota**: Este documento debe ser consultado en cada paso del desarrollo para mantener el rumbo correcto.

> ⚠️ **Advertencia**: La violación de estos mandamientos resultará en regresión técnica y pérdida del valor generado mediante la refactorización. 