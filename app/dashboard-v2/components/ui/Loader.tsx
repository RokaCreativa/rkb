"use client";

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  message?: string;
}

export function Loader({ 
  size = 'md', 
  color = 'border-indigo-600',
  className = '',
  message
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className={`${className} flex flex-col items-center justify-center`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${color}`}
      ></div>
      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
} 