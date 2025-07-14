import React, { useEffect, useState } from 'react'
import { AlertTriangle, X, Check } from 'lucide-react';
export default function CardConfirmation({title,message,isVisible,confirmed,nameButton}) {
   const handleConfirm = () => {
   isVisible(false)
   confirmed()
  };  
  const handleCancel = () => {
    isVisible(false);
  };
  return (
     <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        {/* Overlay et Modal */}
     
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancel}
            ></div>
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                   <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-red-600 hover:bg-red-700 focus:ring-red-500`}
                  >
                    {nameButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
       
      </div>
    </div>
  )
}
