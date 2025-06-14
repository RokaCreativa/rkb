# Sistema de Internacionalización (i18n) para RokaMenu

## 📄 Resumen

Este documento describe el sistema de internacionalización (i18n) implementado en RokaMenu usando `i18next` y `react-i18next`. Este sistema permite traducir la interfaz de usuario a diferentes idiomas de manera sencilla y escalable, manteniendo un único código base.

## 🌍 Idiomas Soportados

Actualmente, el sistema soporta:

- Español (es) - Idioma predeterminado
- Inglés (en)

## 🧩 Componentes del Sistema

### 1. Configuración de i18n (`app/dashboard-v2/i18n/i18n.ts`)

Este archivo configura el sistema i18n con opciones como:

```typescript
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: "es",
    debug: process.env.NODE_ENV === "development",
    // ... otras opciones
  });
```

### 2. Archivos de Traducción

Los archivos de traducción se encuentran en:

- `app/dashboard-v2/i18n/locales/es.json` (Español)
- `app/dashboard-v2/i18n/locales/en.json` (Inglés)

Estos archivos contienen todas las cadenas de texto de la aplicación en formato JSON:

```json
{
  "common": {
    "add": "Añadir",
    "edit": "Editar"
    // ... más traducciones
  },
  "categories": {
    "title": "Categorías"
    // ... más traducciones
  }
  // ... más secciones
}
```

### 3. Hook Personalizado (`useI18n`)

El hook `useI18n` (`app/dashboard-v2/hooks/ui/useI18n.ts`) proporciona una interfaz simplificada para usar i18n:

```typescript
const {
  currentLanguage, // Idioma actual (ej: 'es', 'en')
  availableLanguages, // Lista de idiomas disponibles
  t, // Función para obtener traducciones
  changeLanguage, // Función para cambiar de idioma
} = useI18n();
```

### 4. Componente Selector de Idioma

El componente `LanguageSwitcher` (`app/dashboard-v2/components/ui/LanguageSwitcher.tsx`) permite al usuario cambiar entre los idiomas disponibles:

```tsx
<LanguageSwitcher
  variant="dropdown" // 'dropdown' o 'buttons'
  showText={true} // Mostrar texto del idioma junto a la bandera
  size="md" // 'sm', 'md', 'lg'
/>
```

## 🚀 Cómo Usar

### Traducir Textos en Componentes

#### Usando el Hook `useI18n`

```tsx
import { useI18n } from "../../hooks/ui/useI18n";

function MiComponente() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("categories.title")}</h1>
      <p>{t("categories.noCategories")}</p>
      <button>{t("common.add")}</button>
    </div>
  );
}
```

#### Usando el Hook `useTranslation` Directamente

```tsx
import { useTranslation } from "react-i18next";

function MiComponente() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("categories.title")}</h1>
      {/* ... */}
    </div>
  );
}
```

### Interpolación de Variables

Es posible incluir variables en las traducciones:

```json
// JSON de traducción
{
  "categories": {
    "deleteConfirm": "¿Estás seguro de que deseas eliminar la categoría \"{{name}}\"?"
  }
}
```

```tsx
// Uso en componente
t("categories.deleteConfirm", { name: categoryName });
```

### Pluralización

Para pluralizar traducciones:

```json
// JSON de traducción
{
  "items": {
    "count": "{{count}} elemento",
    "count_plural": "{{count}} elementos"
  }
}
```

```tsx
// Uso en componente
t("items.count", { count: 1 }); // "1 elemento"
t("items.count", { count: 5 }); // "5 elementos"
```

### Cambiar Idioma

```tsx
// Usando el hook
const { changeLanguage } = useI18n();
changeLanguage("en"); // Cambiar a inglés

// Directamente usando i18n
import i18n from "../../i18n/i18n";
i18n.changeLanguage("es"); // Cambiar a español
```

## 📝 Estructura de Claves de Traducción

El sistema usa una estructura jerárquica de claves:

```
common.add
common.edit
categories.title
categories.addNew
products.price
```

Se recomienda seguir este patrón:

- Nivel 1: Dominio o sección (`common`, `categories`, `products`, etc.)
- Nivel 2: Clave específica (`title`, `add`, `delete`, etc.)

## 📊 Organización de Archivos de Traducción

```json
{
  "common": {
    // Textos comunes reutilizados (botones, etiquetas, etc.)
  },
  "dashboard": {
    // Textos específicos del dashboard
  },
  "navigation": {
    // Textos de navegación
  },
  "categories": {
    // Textos relacionados con categorías
  },
  "sections": {
    // Textos relacionados con secciones
  },
  "products": {
    // Textos relacionados con productos
  },
  "modals": {
    // Textos para modales
  },
  "notifications": {
    // Textos para notificaciones
  },
  "validation": {
    // Mensajes de validación
  },
  "forms": {
    // Textos para formularios
  }
}
```

## 🔍 Depuración

Para verificar las traducciones, puedes activar el modo de depuración en `i18n.ts`:

```typescript
debug: true;
```

Esto mostrará información detallada en la consola sobre las traducciones cargadas y utilizadas.

## 💡 Mejores Prácticas

1. **Evitar Hardcodear Textos**: No incluir texto directamente en los componentes.

   ```tsx
   // ❌ MAL
   <button>Añadir</button>

   // ✅ BIEN
   <button>{t('common.add')}</button>
   ```

2. **Usar Claves Descriptivas**: Las claves deben ser descriptivas para facilitar el mantenimiento.

   ```tsx
   // ❌ MAL
   t("c.btn1");

   // ✅ BIEN
   t("categories.addNew");
   ```

3. **Reutilizar Textos Comunes**: Utiliza la sección `common` para textos reutilizados.

   ```tsx
   // Botones comunes, siempre usa common.add, common.edit, etc.
   <button>{t("common.add")}</button>
   ```

4. **Separar por Dominios**: Organiza las traducciones según los dominios de la aplicación.

5. **Usar Interpolación para Textos Dinámicos**: En lugar de concatenar, usa interpolación.

   ```tsx
   // ❌ MAL
   t("categories.greeting") + " " + userName;

   // ✅ BIEN
   t("categories.greeting", { name: userName });
   ```

## 🚀 Ampliar el Sistema

### Añadir Nuevos Idiomas

1. Crea un nuevo archivo JSON en `app/dashboard-v2/i18n/locales/` (ej: `fr.json` para francés)
2. Actualiza `i18n.ts` para incluir el nuevo idioma

   ```typescript
   import frTranslation from './locales/fr.json';

   // ...

   resources: {
     es: { translation: esTranslation },
     en: { translation: enTranslation },
     fr: { translation: frTranslation }
   }
   ```

3. Actualiza `useI18n.ts` para incluir el nuevo idioma en `getAvailableLanguages()`

   ```typescript
   const getAvailableLanguages = (): string[] => {
     return ["es", "en", "fr"];
   };
   ```

4. Añade el nombre y bandera en `LanguageSwitcher.tsx`

   ```typescript
   const LANGUAGE_NAMES: Record<string, string> = {
     es: "Español",
     en: "English",
     fr: "Français",
   };

   const LANGUAGE_FLAGS: Record<string, string> = {
     es: "🇪🇸",
     en: "🇬🇧",
     fr: "🇫🇷",
   };
   ```

### Añadir Nuevas Secciones o Claves

Simplemente actualiza los archivos de traducción con las nuevas claves, manteniendo la misma estructura en todos los idiomas soportados.

## 📚 Recursos Adicionales

- [Documentación oficial de i18next](https://www.i18next.com/)
- [Documentación de react-i18next](https://react.i18next.com/)
- [Interpolación en i18next](https://www.i18next.com/translation-function/interpolation)
- [Pluralización en i18next](https://www.i18next.com/translation-function/plurals)
