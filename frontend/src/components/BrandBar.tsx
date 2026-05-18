import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Tesla', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/tesla.png' },
  { name: 'BMW', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/bmw.png' },
  { name: 'Mercedes', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/mercedes.png' },
  { name: 'Audi', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/audi.png' },
  { name: 'Porsche', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/porsche.png' },
  { name: 'Land Rover', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/land-rover.png' },
  { name: 'Ferrari', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/ferrari.png' },
  { name: 'Lamborghini', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/lamborghini.png' },
  { name: 'Volkswagen', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/volkswagen.png' },
  { name: 'Bentley', logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/bentley.png' },
];

export const BrandBar: React.FC = () => {
  return (
    <div className="py-12 bg-white dark:bg-gray-950 overflow-hidden border-y border-gray-100 dark:border-gray-900">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">
          Nos Marques d'Excellence
        </p>
      </div>
      <div className="relative flex">
        <motion.div 
          className="flex gap-16 sm:gap-24 items-center whitespace-nowrap"
          animate={{
            x: [0, -1500],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {[...brands, ...brands, ...brands].map((brand, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-pointer px-4">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-8 sm:h-12 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-600 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{brand.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
