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
  const { t, isRTL, language } = useLanguage();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
    { id: "all", label: t("common.all") },
    { id: "Luxe", label: isRTL ? "فاخرة" : "Luxe" },
    { id: "Sport", label: isRTL ? "رياضية" : "Sport" },
    { id: "SUV", label: "SUV" },
    { id: "Electrique", label: isRTL ? "كهربائية" : "Électrique" },
  ];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      !searchQuery ||
      car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "all") return true;
    
    // Support cases where category might be missing or localized in DB
    const carCat = car.category || "Luxe";
    return carCat === selectedCategory;
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
          {t("cars.sync")}
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
          {t("cars.empty")}
        </h3>
        <p className="text-gray-500 font-medium">
          {t("cars.empty_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentPage(1);
            }}
            className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all text-xs sm:text-base ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105"
                : "bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        <AnimatePresence mode="popLayout">
          {paginatedCars.map((car, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              key={car._id}
              className="group relative bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
              onMouseEnter={() => setHoveredCar(car._id)}
              onMouseLeave={() => setHoveredCar(null)}
            >
              <div className="relative h-48 sm:h-72 overflow-hidden">
                <img
                  src={car.image}
                  alt={car.brand + " " + car.model}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
                    {car.category}
                  </span>
                </div>
                <div className={`absolute top-4 sm:top-6 right-4 sm:right-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black tracking-widest text-white shadow-lg ${car.available !== false ? "bg-green-500" : "bg-red-500"}`}>
                  {car.available !== false ? t("cars.available") : t("cars.rented")}
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-1">
                      {car.brand}
                    </h3>
                    <p className="text-blue-500 font-bold text-base sm:text-lg">
                      {car.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white">
                      {car.pricePerDay} {t("common.currency")}
                    </span>
                    <span className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      / {t("common.day")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8">
                  <div className="text-center">
                    <Fuel className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-blue-500" />
                    <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-0.5 sm:mb-1">
                      {t("cars.fuel")}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold dark:text-white uppercase truncate px-1">
                      {car.fuel}
                    </div>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-blue-500" />
                    <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-0.5 sm:mb-1">
                      {t("cars.seats")}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold dark:text-white">
                      {car.seats}
                    </div>
                  </div>
                  <div className="text-center">
                    <Gauge className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-blue-500" />
                    <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-0.5 sm:mb-1">
                      {t("cars.speed")}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold dark:text-white">
                      {car.speed}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => car.available !== false && onCarSelect?.(car._id)}
                    disabled={car.available === false}
                    className={`flex-1 py-3.5 sm:py-4 font-black rounded-xl sm:rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
                      car.available !== false 
                        ? "bg-gray-950 dark:bg-white dark:text-gray-950 text-white hover:scale-105" 
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {t("cars.view_details").toUpperCase()}
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => car.available !== false && onCarSelect?.(car._id)}
                    disabled={car.available === false}
                    className={`flex-[1.5] py-3.5 sm:py-4 font-black rounded-xl sm:rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
                      car.available !== false 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:scale-105" 
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {car.available !== false ? t("cars.book_now").toUpperCase() : t("cars.rented").toUpperCase()}
                    <ChevronRight size={16} />
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
