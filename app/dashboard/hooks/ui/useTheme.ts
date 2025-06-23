import { useCallback } from 'react';

/**
 * Hook para gestionar las variables CSS del tema
 * Permite actualizar en tiempo real las variables CSS definidas en theme.css
 */
export const useTheme = () => {
  /**
   * Actualiza una variable CSS específica en el documento
   * 
   * @param variable - La variable CSS a actualizar (debe incluir --) 
   * @param value - El nuevo valor para la variable
   */
  const updateThemeVariable = useCallback((variable: string, value: string) => {
    if (!variable || !value) return;
    document.documentElement.style.setProperty(variable, value);
  }, []);
  
  /**
   * Restablece una variable CSS a su valor original
   * 
   * @param variable - La variable CSS a restablecer
   */
  const resetThemeVariable = useCallback((variable: string) => {
    if (!variable) return;
    document.documentElement.style.removeProperty(variable);
  }, []);
  
  /**
   * Establece múltiples variables CSS a la vez
   * 
   * @param variables - Un objeto con las variables y sus valores
   */
  const setMultipleVariables = useCallback((variables: Record<string, string>) => {
    if (!variables) return;
    
    Object.entries(variables).forEach(([variable, value]) => {
      updateThemeVariable(variable, value);
    });
  }, [updateThemeVariable]);
  
  /**
   * Restablece todas las variables personalizadas del tema
   */
  const resetAllThemeVariables = useCallback(() => {
    const styleProperties = Array.from(document.documentElement.style);
    styleProperties.forEach(property => {
      if (property.startsWith('--')) {
        document.documentElement.style.removeProperty(property);
      }
    });
  }, []);
  
  /**
   * Obtiene el valor actual de una variable CSS
   * 
   * @param variable - La variable CSS a consultar
   * @returns El valor actual de la variable
   */
  const getThemeVariable = useCallback((variable: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }, []);
  
  return {
    updateThemeVariable,
    resetThemeVariable,
    setMultipleVariables,
    resetAllThemeVariables,
    getThemeVariable
  };
};

export default useTheme; 