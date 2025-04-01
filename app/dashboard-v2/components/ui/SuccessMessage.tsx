"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SuccessMessageProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  showProgress?: boolean;
  type?: 'success' | 'info' | 'loading';
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export default function SuccessMessage({
  message,
  duration = 3000,
  onClose,
  showProgress = true,
  type = 'success',
  position = 'top-right'
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Posicionamiento del componente
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  // Colores según el tipo
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconColor: 'text-green-500',
      progressBg: 'bg-green-200',
      progressFill: 'bg-green-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconColor: 'text-blue-500',
      progressBg: 'bg-blue-200',
      progressFill: 'bg-blue-500'
    },
    loading: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      iconColor: 'text-amber-500',
      progressBg: 'bg-amber-200',
      progressFill: 'bg-amber-500'
    }
  };

  const currentStyle = typeStyles[type];

  // Efecto para la barra de progreso y cerrar automáticamente
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;

    if (showProgress && type !== 'loading') {
      const step = 100 / (duration / 10); // Actualizar cada 10ms
      progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prevProgress - step;
        });
      }, 10);
    }

    if (type !== 'loading') {
      closeTimeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // tiempo para la animación de salida
      }, duration);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(closeTimeout);
    };
  }, [duration, onClose, showProgress, type]);

  // Renderizado condicional de íconos
  const renderIcon = () => {
    if (type === 'success') {
      return <CheckCircleIcon className={`h-5 w-5 ${currentStyle.iconColor}`} />;
    } else if (type === 'info') {
      return <InformationCircleIcon className={`h-5 w-5 ${currentStyle.iconColor}`} />;
    } else if (type === 'loading') {
      return (
        <svg className={`animate-spin h-5 w-5 ${currentStyle.iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
  };

  if (!isVisible && type !== 'loading') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50 max-w-md p-0 shadow-lg rounded-lg overflow-hidden`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} rounded-lg border shadow-sm`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                {renderIcon()}
                <p className="font-medium text-sm">{message}</p>
              </div>
              {type !== 'loading' && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose?.(), 300);
                  }}
                  className={`${currentStyle.text} hover:opacity-70 focus:outline-none`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            {showProgress && (
              <div className={`h-1 w-full ${currentStyle.progressBg}`}>
                {type === 'loading' ? (
                  <motion.div 
                    className={`h-full ${currentStyle.progressFill}`}
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: "100%",
                      transition: { 
                        repeat: Infinity, 
                        duration: 1.5, 
                        ease: "easeInOut" 
                      }
                    }}
                  />
                ) : (
                  <div 
                    className={`h-full ${currentStyle.progressFill}`} 
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 