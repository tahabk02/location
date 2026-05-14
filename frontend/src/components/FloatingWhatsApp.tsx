import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const FloatingWhatsApp = () => {
  const [showTooltip, setShowShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // Hide on Admin or SuperAdmin pages
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

  useEffect(() => {
    if (isAdminPath) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => setShowShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, [isAdminPath]);

  if (isAdminPath || !isVisible) return null;

  const handleClick = () => {
    const message = "Bonjour AVENIR KAMIL CAR, je souhaiterais avoir plus d'informations sur vos véhicules disponibles.";
    window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] flex flex-col items-end gap-3 sm:gap-4">
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-900 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 relative mb-1 sm:mb-2 max-w-[200px] sm:max-w-none group"
          >
            <button 
              onClick={() => setShowShowTooltip(false)}
              className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
            <p className="text-[10px] sm:text-sm font-black text-gray-900 dark:text-white">Besoin d'aide ? Chattez avec nous !</p>
            <div className="absolute right-4 -bottom-2 w-3 h-3 sm:w-4 sm:h-4 bg-white dark:bg-gray-900 border-r border-b border-gray-100 dark:border-gray-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-3 -left-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Fermer"
        >
          <X size={12} />
        </button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="w-12 h-12 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] transition-colors relative"
        >
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      </div>
    </div>
  );
};

