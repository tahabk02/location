import {
  Fuel,
  Users,
  Gauge,
  Star,
  Shield,
  Calendar,
  MapPin,
  ChevronRight,
  Heart,
  Play,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getCars } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface CarsProps {
  onCarSelect?: (carId: string) => void;
  searchQuery?: string;
}

export const Cars: React.FC<CarsProps> = ({ onCarSelect, searchQuery }) => {
  const { t, isRTL } = useLanguage();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchCars() {
      try {
        const data = await getCars();
        setCars(data || []);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const categories = [
    isRTL ? "الكل" : "Tous",
    isRTL ? "فاخرة" : "Luxe",
    isRTL ? "رياضية" : "Sport",
    "SUV",
    isRTL ? "كهربائية" : "Électrique",
    isRTL ? "فخامة قصوى" : "Ultra Luxe",
  ];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      !searchQuery ||
      car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "Tous") return true;
    return car.category === selectedCategory;
  });

  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-sm text-center">
          Synchronisation de la flotte...
        </p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div className="inline-flex p-6 bg-blue-500/10 rounded-full mb-6">
          <Shield className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Aucun véhicule disponible
        </h3>
        <p className="text-gray-500 font-medium">
          Revenez plus tard pour découvrir notre nouvelle collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105"
                : "bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {paginatedCars.map((car, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              key={car._id}
              className="group relative bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
              onMouseEnter={() => setHoveredCar(car._id)}
              onMouseLeave={() => setHoveredCar(null)}
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={car.image}
                  alt={car.brand + " " + car.model}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl text-[10px] font-black tracking-widest uppercase">
                    {car.category}
                  </span>
                </div>
              </div>

              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                      {car.brand}
                    </h3>
                    <p className="text-blue-500 font-bold text-lg">
                      {car.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      {car.pricePerDay} DH
                    </span>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      / jour
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl mb-8">
                  <div className="text-center">
                    <Fuel className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Energie
                    </div>
                    <div className="text-xs font-bold dark:text-white uppercase">
                      {car.fuel}
                    </div>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Places
                    </div>
                    <div className="text-xs font-bold dark:text-white">
                      {car.seats}
                    </div>
                  </div>
                  <div className="text-center">
                    <Gauge className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Vitesse
                    </div>
                    <div className="text-xs font-bold dark:text-white">
                      {car.speed}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => onCarSelect?.(car._id)}
                    className="flex-1 py-4 bg-gray-950 dark:bg-white dark:text-gray-950 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    DÉTAILS
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onCarSelect?.(car._id)}
                    className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    RÉSERVER
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
