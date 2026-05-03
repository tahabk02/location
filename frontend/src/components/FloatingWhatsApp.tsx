import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingWhatsApp = () => {
  const [showTooltip, setShowShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = "Bonjour LuxeDrive, je souhaiterais avoir plus d'informations sur vos véhicules disponibles.";
    window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 relative mb-2"
          >
            <p className="text-sm font-black text-gray-900 dark:text-white">Besoin d'aide ? Chattez avec nous !</p>
            <div className="absolute right-4 -bottom-2 w-4 h-4 bg-white dark:bg-gray-900 border-r border-b border-gray-100 dark:border-gray-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] transition-colors relative"
      >
        <MessageCircle size={32} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    </div>
  );
};
