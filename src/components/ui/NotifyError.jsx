import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

 const NotifyError = ({ 
  title = "Erreur", 
  message, 
  isVisible=false,
  onClose, 
  autoClose = true, 
  duration = 5000,
  position = 'top-right'
}) => {
  const [show, setShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
          
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 300);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-16 right-6';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!show) return null;

  return (
    <div className={`fixed w-[400px] h-[400px] z-50 ${getPositionClasses()}`}>
      <div className={`
        bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md left-0 right-0 w-full
        transform transition-all duration-300 ease-in-out
        ${isAnimating 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95'
        }
      `}>
        {/* Contenu principal */}
        <div className="flex items-start space-x-3">
          {/* Icône avec animation */}
          <div className={`
            text-red-500 flex-shrink-0 
            transform transition-transform duration-500
            ${isAnimating ? 'rotate-0 scale-100' : 'rotate-180 scale-75'}
          `}>
            <AlertCircle className="w-5 h-5" />
          </div>

          {/* Contenu du message */}
          <div className="flex-1 min-w-0">
            <h4 className="text-red-800 font-medium text-sm mb-1">
              {title}
            </h4>
            <p className="text-red-700 text-sm">
              {message}
            </p>
          </div>

          {/* Bouton de fermeture */}
          <button
            onClick={handleClose}
            className="
              text-red-500 flex-shrink-0 
              hover:bg-red-100 rounded-full p-1 
              transition-all duration-200 hover:scale-110
            "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre de progression pour l'auto-close */}
        {autoClose && (
          <div className="mt-3 bg-red-200 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-red-500 h-full transition-all duration-100 ease-linear"
              style={{
                animation: `progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
 export default NotifyError;
// Composant de démonstration
