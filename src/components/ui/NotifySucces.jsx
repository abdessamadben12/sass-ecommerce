import { Check, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export const NotifySuccess = ({ message,sucess,onClose}) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
 const showTimeout = setTimeout(() => setVisible(true), 10);
  const autoCloseTimeout = setTimeout(() =>onClose(false)
, 3000);
  return () => {
    clearTimeout(showTimeout);
    clearTimeout(autoCloseTimeout);
  };

  }, []);
  const handleClose = () => {
    onClose(false)
    setLeaving(sucess);
  };
  return (
   <div className="fixed right-0 top-10 z-50  w-[30%]">
     <div
      className={`
        bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4
        transform transition-all duration-700 ease-in-out
        ${visible && !leaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="flex items-start">
        <div className="bg-green-500 rounded-full p-2">
          <Check size={16} className="text-white font-bold" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-md font-semibold  text-gray-600">{message}</p>
        </div>
        <button onClick={handleClose} className="ml-4 p-1 rounded hover:bg-gray-100">
          <X size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    </div>
   </div>
  );
};