"use client";

import { useCallback } from 'react';

/**
 * Hook para controlar la visibilidad del componente de vista previa del teléfono
 * Expone un método para disparar un evento personalizado que será capturado por
 * el componente FloatingPhonePreview
 */
export function usePhonePreviewToggle() {
  const togglePreview = useCallback(() => {
    // Crear y disparar un evento personalizado
    const event = new Event('toggle-preview');
    window.dispatchEvent(event);
  }, []);

  return togglePreview;
} 