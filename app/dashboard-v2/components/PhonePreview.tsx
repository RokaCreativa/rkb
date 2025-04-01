"use client";

import React from 'react';
import Image from 'next/image';

export function PhonePreview() {
  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden relative p-2">
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="bg-black text-white py-2 px-6 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs">9:41</span>
          </div>
          <div className="flex space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3l-6 6m0 0l-6-6m6 6l-6 6m6-6l6 6" />
            </svg>
          </div>
        </div>
        
        <div className="h-[500px] bg-gray-50 overflow-auto">
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="rounded-full bg-indigo-100 p-3 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Vista Previa del Menú</h2>
            <p className="text-gray-600 mb-4">Selecciona una categoría para ver su contenido en la vista previa.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 