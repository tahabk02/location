import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png' },
  { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2048px-BMW.svg.png' },
  { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_logo.svg/2048px-Mercedes-Benz_logo.svg.png' },
  { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/2560px-Audi-Logo_2016.svg.png' },
  { name: 'Porsche', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Porsche-logo.svg/1200px-Porsche-logo.svg.png' },
  { name: 'Range Rover', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Land_Rover_logo.svg/1200px-Land_Rover_logo.svg.png' },
  { name: 'Ferrari', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/1200px-Ferrari-Logo.svg.png' },
  { name: 'Lamborghini', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Lamborghini_Logo.svg/1200px-Lamborghini_Logo.svg.png' },
];

export const BrandBar: React.FC = () => {
  return (
    <div className="py-10 bg-white dark:bg-gray-950 overflow-hidden border-y border-gray-100 dark:border-gray-900">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600">
          Nos Marques Partenaires
        </p>
      </div>
      <div className="relative flex">
        <motion.div 
          className="flex gap-12 sm:gap-20 items-center whitespace-nowrap"
          animate={{
            x: [0, -1035],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {[...brands, ...brands].map((brand, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-6 sm:h-10 w-auto object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
              <span className="text-xs sm:text-sm font-bold text-gray-300 dark:text-gray-700 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{brand.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
