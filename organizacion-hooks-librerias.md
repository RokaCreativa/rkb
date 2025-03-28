# Guía para Organizar Hooks y Librerías en Next.js

Esta guía explica cómo organizar los hooks y librerías en tu proyecto Next.js para mejorar la mantenibilidad y rendimiento.

## Organización de Hooks

### Estructura Recomendada

```
/hooks
  /dashboard
    useCategories.ts
    useSections.ts
    useProducts.ts
    useClientData.ts
  /forms
    useForm.ts
    useValidation.ts
  /ui
    useModal.ts
    useToast.ts
    useMediaQuery.ts
  index.ts         # Para exportar todos los hooks
```

### Buenas Prácticas para Hooks

#### 1. Nombrar adecuadamente los hooks

✅ **Correcto**: Siempre comienza con `use` (convención de React)
```javascript
// ✓ Correcto
export function useCategories() { /* ... */ }

// ✗ Incorrecto
export function categoriesHook() { /* ... */ }
export function getCategories() { /* ... */ }
```

#### 2. Un hook por archivo

Cada hook debe estar en su propio archivo con un nombre descriptivo que refleje su función.

```javascript
// hooks/dashboard/useCategories.ts
export function useCategories() {
  // Implementación
}

// No mezclar múltiples hooks en un mismo archivo
```

#### 3. Crear un archivo índice para exportaciones

```javascript
// hooks/index.ts
export * from './dashboard/useCategories';
export * from './dashboard/useSections';
export * from './forms/useForm';
// etc.
```

#### 4. Implementación básica de un hook

```javascript
// hooks/dashboard/useCategories.ts
import { useState, useEffect } from 'react';
import { fetchCategories } from '@/lib/api/endpoints';

export function useCategories(clientId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await fetchCategories(clientId);
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      loadCategories();
    }
  }, [clientId]);

  // Funciones para manipular categorías
  const addCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id, updatedData) => {
    setCategories(prev => 
      prev.map(cat => cat.id === id ? {...cat, ...updatedData} : cat)
    );
  };

  return { 
    categories, 
    loading, 
    error,
    addCategory,
    updateCategory
  };
}
```

#### 5. Composición de hooks

A veces, puedes crear hooks más complejos combinando hooks más simples:

```javascript
// hooks/dashboard/useDashboard.ts
import { useCategories } from './useCategories';
import { useSections } from './useSections';
import { useProducts } from './useProducts';
import { useClientData } from './useClientData';

export function useDashboard(clientId) {
  const clientData = useClientData(clientId);
  const categories = useCategories(clientId);
  const sections = useSections(clientId);
  const products = useProducts(clientId);

  // Combinar la información y añadir lógica adicional
  
  return {
    client: clientData.client,
    isLoading: clientData.loading || categories.loading || sections.loading || products.loading,
    hasErrors: !!clientData.error || !!categories.error || !!sections.error || !!products.error,
    data: {
      categories: categories.categories,
      sections: sections.sections,
      products: products.products
    },
    actions: {
      addCategory: categories.addCategory,
      updateSection: sections.updateSection,
      // etc.
    }
  };
}
```

## Organización de Librerías

### Estructura Recomendada

```
/lib
  /api
    fetcher.ts
    endpoints.ts
  /utils
    formatting.ts
    calculations.ts
  /validation
    schemas.ts
    validators.ts
  /transforms
    dataTransforms.ts
  index.ts         # Para exportar funciones comunes
```

### Buenas Prácticas para Librerías

#### 1. Organizar por dominio funcional

Agrupa las funciones según su propósito funcional, no por tipo técnico.

```javascript
// ✓ Correcto
/lib/api/endpoints.ts   // Todas las funciones relacionadas con API
/lib/validation/schemas.ts  // Todas las funciones de validación

// ✗ Incorrecto
/lib/functions.ts  // Mezclando diferentes tipos de funciones
/lib/helpers.ts    // Nombre demasiado genérico
```

#### 2. Implementación de una librería API

```javascript
// lib/api/fetcher.ts
export async function fetcher(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Añadir headers adicionales
    },
    ...options
  });

  if (!response.ok) {
    const error = new Error('Error en la petición API');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// lib/api/endpoints.ts
import { fetcher } from './fetcher';

export async function fetchCategories(clientId) {
  return fetcher(`/api/clients/${clientId}/categories`);
}

export async function fetchSections(clientId, categoryId) {
  return fetcher(`/api/clients/${clientId}/categories/${categoryId}/sections`);
}

export async function createCategory(clientId, categoryData) {
  return fetcher(`/api/clients/${clientId}/categories`, {
    method: 'POST',
    body: JSON.stringify(categoryData)
  });
}
```

#### 3. Funciones de utilidad claras y con un solo propósito

```javascript
// lib/utils/formatting.ts
export function formatPrice(price, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(price);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// lib/utils/calculations.ts
export function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateDiscount(price, discountPercentage) {
  return price - (price * (discountPercentage / 100));
}
```

#### 4. Validación centralizada

```javascript
// lib/validation/schemas.ts
import * as z from 'zod';

export const categorySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  image: z.string().url('Debe ser una URL válida').optional(),
  status: z.number().int().min(0).max(1)
});

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  price: z.number().positive('El precio debe ser positivo'),
  description: z.string().optional(),
  image: z.string().url('Debe ser una URL válida').optional(),
  categoryId: z.number().int().positive(),
  sectionId: z.number().int().positive().optional()
});

// lib/validation/validators.ts
import { categorySchema, productSchema } from './schemas';

export function validateCategory(data) {
  try {
    const result = categorySchema.parse(data);
    return { valid: true, data: result };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}

export function validateProduct(data) {
  try {
    const result = productSchema.parse(data);
    return { valid: true, data: result };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}
```

#### 5. Transformaciones de datos

```javascript
// lib/transforms/dataTransforms.ts
export function transformCategoryForAPI(category) {
  // Transforma los datos para enviar a la API
  return {
    name: category.name,
    description: category.description || '',
    image_url: category.image,
    status: Number(category.status)
  };
}

export function transformCategoryFromAPI(apiCategory) {
  // Transforma los datos recibidos de la API al formato de la aplicación
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description,
    image: apiCategory.image_url,
    status: apiCategory.status,
    createdAt: new Date(apiCategory.created_at),
    updatedAt: new Date(apiCategory.updated_at)
  };
}
```

## Integración con Componentes

### Ejemplo de uso de hooks en componentes

```jsx
// app/dashboard/categories/page.tsx
'use client';

import { useCategories } from '@/hooks/dashboard/useCategories';
import { CategoryList } from '@/components/dashboard/CategoryList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function CategoriesPage({ params }) {
  const clientId = params.clientId;
  const { categories, loading, error, addCategory, updateCategory } = useCategories(clientId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>
      <CategoryList 
        categories={categories} 
        onEdit={updateCategory} 
        onAdd={addCategory}
      />
    </div>
  );
}
```

### Ejemplo de uso de librería en componentes

```jsx
// components/dashboard/ProductItem.jsx
import { formatPrice } from '@/lib/utils/formatting';
import { validateProduct } from '@/lib/validation/validators';
import { transformProductForAPI } from '@/lib/transforms/dataTransforms';

export function ProductItem({ product, onUpdate }) {
  const handleSubmit = async (formData) => {
    const productData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description'),
      // etc.
    };
    
    const validation = validateProduct(productData);
    
    if (!validation.valid) {
      // Manejar errores de validación
      return;
    }
    
    const apiData = transformProductForAPI(validation.data);
    await onUpdate(product.id, apiData);
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="font-bold">{product.name}</h3>
      <p className="text-green-600 font-semibold">{formatPrice(product.price)}</p>
      <p className="text-gray-600">{product.description}</p>
      {/* Resto del componente */}
    </div>
  );
}
```

## Errores Comunes a Evitar

### 1. Hook dentro de un condicional o bucle

```javascript
// ✗ INCORRECTO - Viola las reglas de los hooks
function Component({ condition }) {
  if (condition) {
    // Error: Los hooks deben estar siempre en el nivel superior
    const [state, setState] = useState('');
  }
  
  // Resto del componente
}

// ✓ CORRECTO
function Component({ condition }) {
  const [state, setState] = useState('');
  
  // Usar el estado condicionalmente es correcto
  if (condition) {
    // Lógica que usa state
  }
  
  // Resto del componente
}
```

### 2. No memoizar funciones en componentes

```javascript
// ✗ INCORRECTO - Crea una nueva función en cada renderizado
function CategoryList({ categories }) {
  const handleEdit = (id) => {
    // Lógica para editar
  };
  
  return (
    <ul>
      {categories.map(category => (
        <li key={category.id} onClick={() => handleEdit(category.id)}>
          {category.name}
        </li>
      ))}
    </ul>
  );
}

// ✓ CORRECTO - Usa useCallback para memoizar la función
function CategoryList({ categories }) {
  const handleEdit = useCallback((id) => {
    // Lógica para editar
  }, []);
  
  return (
    <ul>
      {categories.map(category => (
        <li key={category.id} onClick={() => handleEdit(category.id)}>
          {category.name}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Duplicación de lógica de API

```javascript
// ✗ INCORRECTO - Lógica de API repetida en múltiples componentes
function ComponentA() {
  const fetchData = async () => {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Error fetching data');
    return res.json();
  };
  
  // Uso de fetchData
}

function ComponentB() {
  const fetchData = async () => {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Error fetching data');
    return res.json();
  };
  
  // Uso de fetchData
}

// ✓ CORRECTO - Centralizar en lib/api
// lib/api/endpoints.ts
export async function fetchData() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Error fetching data');
  return res.json();
}

// Componentes
function ComponentA() {
  // Usar fetchData importado
}

function ComponentB() {
  // Usar fetchData importado
}
```

## Beneficios de la Organización Propuesta

1. **Reutilización de código**: Al centralizar lógica en hooks y librerías, puedes reutilizarla fácilmente.

2. **Separación de responsabilidades**: La lógica de negocio está separada de los componentes UI.

3. **Pruebas más fáciles**: Es mucho más sencillo hacer testing de hooks y funciones aisladas.

4. **Mantenibilidad**: Cuando necesites modificar una función, solo tendrás que hacerlo en un lugar.

5. **Rendimiento**: Facilita la implementación de optimizaciones como memoización.

6. **Colaboración**: Diferentes desarrolladores pueden trabajar en distintas partes del código sin conflictos.

7. **Escalabilidad**: A medida que crece la aplicación, esta estructura facilita añadir nuevas funcionalidades.

## Ejemplo Final: Integración Completa

Veamos un ejemplo de cómo todos estos elementos se integran en un flujo completo:

```jsx
// hooks/forms/useProductForm.ts
import { useState } from 'react';
import { validateProduct } from '@/lib/validation/validators';
import { transformProductForAPI } from '@/lib/transforms/dataTransforms';
import { createProduct, updateProduct } from '@/lib/api/endpoints';

export function useProductForm(clientId, initialData = {}) {
  const [product, setProduct] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    const validation = validateProduct(product);
    
    if (!validation.valid) {
      const formattedErrors = validation.errors.reduce((acc, error) => {
        acc[error.path] = error.message;
        return acc;
      }, {});
      
      setErrors(formattedErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const apiData = transformProductForAPI(validation.data);
      
      if (product.id) {
        // Actualizar producto existente
        await updateProduct(clientId, product.id, apiData);
      } else {
        // Crear nuevo producto
        await createProduct(clientId, apiData);
      }
      
      // Éxito - reiniciar formulario si es necesario
      if (!product.id) {
        setProduct(initialData);
      }
      
      return true; // Indicar éxito
    } catch (error) {
      setSubmitError(error.message || 'Error al guardar el producto');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    product,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit
  };
}

// components/dashboard/ProductForm.jsx
import { useProductForm } from '@/hooks/forms/useProductForm';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export function ProductForm({ clientId, initialProduct = {}, onSuccess }) {
  const {
    product,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit
  } = useProductForm(clientId, initialProduct);
  
  const onFormSubmit = async (e) => {
    const success = await handleSubmit(e);
    if (success && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      {submitError && <ErrorAlert message={submitError} />}
      
      <TextField
        label="Nombre"
        name="name"
        value={product.name || ''}
        onChange={handleChange}
        error={errors.name}
        required
      />
      
      <TextField
        label="Precio"
        name="price"
        type="number"
        step="0.01"
        value={product.price || ''}
        onChange={handleChange}
        error={errors.price}
        required
      />
      
      <TextField
        label="Descripción"
        name="description"
        value={product.description || ''}
        onChange={handleChange}
        error={errors.description}
        multiline
      />
      
      {/* Más campos */}
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {product.id ? 'Actualizar Producto' : 'Crear Producto'}
      </Button>
    </form>
  );
}

// app/dashboard/products/new/page.tsx
'use client';

import { ProductForm } from '@/components/dashboard/ProductForm';
import { useRouter } from 'next/navigation';

export default function NewProductPage({ params }) {
  const clientId = params.clientId;
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push(`/dashboard/${clientId}/products`);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nuevo Producto</h1>
      <ProductForm 
        clientId={clientId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## Conclusión

Organizar adecuadamente los hooks y librerías en tu proyecto Next.js te permite:

1. **Mantener el código ordenado y fácil de navegar**
2. **Reutilizar lógica en múltiples componentes**
3. **Separar responsabilidades (UI vs. lógica de negocio)**
4. **Facilitar el testing y mantenimiento**
5. **Mejorar el rendimiento de la aplicación**

La inversión inicial de tiempo en configurar esta estructura pagará dividendos a medida que tu aplicación crezca en complejidad. Comienza con los patrones básicos y adapta la estructura según las necesidades específicas de tu proyecto.

---

**Nota**: Esta guía asume que estás utilizando TypeScript, pero los principios son aplicables a JavaScript. También se recomienda el uso de ESLint con reglas específicas para hooks para detectar errores comunes en tiempo de desarrollo. 