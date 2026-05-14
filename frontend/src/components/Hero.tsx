import {
  ArrowRight,
  MapPin,
  Calendar,
  Shield,
  Sparkles,
  Star,
  ChevronRight,
  CheckCircle,
  Zap,
  Infinity as InfinityIcon,
  Car as CarIcon,
  Gauge,
  BatteryCharging,
  Users,
  Cpu,
  Navigation,
  Volume2,
  Wind,
  Thermometer,
  Bluetooth,
  Wifi,
  Satellite,
  Target,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Cloud,
  Droplets,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { getCars } from "../services/api";

interface HeroProps {
  onBook: (carId: string) => void;
  onExplore: (carId: string) => void;
  isMobile?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onBook, onExplore, isMobile }) => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [realCars, setRealCars] = useState<any[]>([]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCar, setActiveCar] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [isPlaying, setIsPlaying] = useState(false);
  const [carSpeed, setCarSpeed] = useState(0);
  const [ambientSound, setAmbientSound] = useState(30);
  const [showInterface, setShowInterface] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(85);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchRealCars = async () => {
      try {
        const fetchedCars = await getCars();
        if (fetchedCars && fetchedCars.length > 0) {
          setRealCars(fetchedCars.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching cars for hero:", error);
      }
    };
    fetchRealCars();
  }, []);

  const defaultCars = [
    {
      _id: "default-1",
      name: "Tesla Model S Plaid",
      brand: "Tesla",
      model: "Model S",
      pricePerDay: 1000,
      image: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
      specs: {
        power: "1020ch",
        acceleration: "2.1s",
      },
    },
    {
      _id: "default-2",
      name: "Porsche 911 Turbo S",
      brand: "Porsche",
      model: "911",
      pricePerDay: 199,
      image: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
      specs: {
        power: "650ch",
        acceleration: "2.7s",
      },
    },
  ];

  const currentCars = realCars.length > 0 ? realCars : defaultCars;
  const activeCarData = currentCars[activeCar] || currentCars[0];

  const handlePlaySound = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setTimeOfDay((prev) => {
        const times = ["day", "sunset", "night", "sunrise"];
        const currentIndex = times.indexOf(prev);
        return times[(currentIndex + 1) % times.length];
      });
    }, 15000);

    const speedInterval = setInterval(() => {
      setCarSpeed((prev) => {
        if (prev < 320) return prev + 5;
        return 320;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(speedInterval);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setShowInterface((prev) => !prev);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  const getTimeOfDayGradient = () => {
    const isLight = theme === 'light';
    switch (timeOfDay) {
      case "day":
        return isLight ? "from-blue-50 via-cyan-50/50 to-blue-100" : "from-blue-900/30 via-cyan-900/20 to-blue-900/30";
      case "sunset":
        return isLight ? "from-orange-50 via-red-50/50 to-orange-100" : "from-orange-900/40 via-red-900/30 to-purple-900/40";
      case "night":
        return isLight ? "from-indigo-50 via-gray-50 to-indigo-100" : "from-indigo-900/50 via-purple-900/40 to-gray-900/50";
      case "sunrise":
        return isLight ? "from-pink-50 via-yellow-50/50 to-blue-50" : "from-pink-900/40 via-yellow-900/30 to-blue-900/40";
      default:
        return isLight ? "from-blue-50 via-cyan-50/50 to-blue-100" : "from-blue-900/30 via-cyan-900/20 to-blue-900/30";
    }
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case "day": return Sun;
      case "sunset": return Sunset;
      case "night": return Moon;
      case "sunrise": return Sunrise;
      default: return Sun;
    }
  };

  const TimeIcon = getTimeIcon();

  const getParticleAnimation = (index: number) => {
    const duration = Math.random() * 10 + 5;
    const delay = Math.random() * 5;
    return `quantumFloat ${duration}s linear infinite ${delay}s`;
  };

  const getBeamAnimation = (index: number) => {
    const duration = 8 + index * 2;
    const delay = index * 0.5;
    return `beamSweep ${duration}s linear infinite ${delay}s`;
  };

  const neuralPaths = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        d: `M${Math.random() * 100} ${Math.random() * 100} Q${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100}`,
        delay: i * 0.3,
      })),
    [],
  );

  const quantumParticles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color: `rgba(${59 + Math.random() * 196}, ${130 + Math.random() * 126}, ${246 + Math.random() * 10}, ${0.1 + Math.random() * 0.3})`,
        animation: getParticleAnimation(i),
        opacity: Math.random() * 0.5 + 0.1,
      })),
    [],
  );

  const getQuantumPulseAnimation = (index: number) => {
    const duration = 1 + Math.random();
    const delay = index * 0.01;
    return `quantumPulse ${duration}s ease-in-out infinite ${delay}s`;
  };

  const getScanAnimation = (index: number) => {
    const duration = 2 + Math.random();
    const delay = Math.random();
    return `scan ${duration}s linear infinite ${delay}s`;
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className={`relative min-h-screen lg:h-screen flex items-start lg:items-center justify-center overflow-hidden transition-colors duration-1000 ${
        theme === 'light' ? 'bg-white' : 'bg-gradient-to-br from-gray-950 via-black to-gray-950'
      }`}
    >
      {/* Dynamic Time of Day Overlay */}
      <div className={`absolute inset-0 transition-all duration-2000 ${getTimeOfDayGradient()} z-0`} />

      {/* Advanced Holographic Interface */}
      <div className={`absolute inset-0 z-10 transition-all duration-1000 ${showInterface ? "opacity-100" : "opacity-0"} hidden sm:block`}>
        <div className="absolute inset-0 perspective-2000">
          <div
            className={`absolute inset-0 ${theme === 'light' ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]'}`}
            style={{
              transform: `translateZ(${mousePosition.y * 0.5}px) rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)`,
            }}
          />
        </div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={theme === 'light' ? "0.1" : "0.3"} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={theme === 'light' ? "0.2" : "0.5"} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={theme === 'light' ? "0.1" : "0.3"} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {neuralPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              fill="none"
              stroke="url(#neural-gradient)"
              strokeWidth="0.5"
              strokeDasharray="5,5"
              style={{ animation: `neural 8s linear infinite`, animationDelay: `${path.delay}s` }}
              filter="url(#glow)"
            />
          ))}
        </svg>
      </div>

      {/* Quantum Particles System */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        {quantumParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full quantum-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: particle.top,
              left: particle.left,
              background: `radial-gradient(circle at center, ${particle.color} 0%, transparent 70%)`,
              animation: particle.animation,
              opacity: theme === 'light' ? particle.opacity * 0.5 : particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Dynamic Light Beams */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-px h-64 ${theme === 'light' ? 'bg-gradient-to-b from-transparent via-blue-400/10 to-transparent' : 'bg-gradient-to-b from-transparent via-blue-500/20 to-transparent'} rotate-45`}
            style={{ left: `${(i / 8) * 100}%`, animation: getBeamAnimation(i), transformOrigin: "top center" }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-12 lg:py-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <div className="space-y-4 sm:space-y-10 order-2 lg:order-1">
            <div className="flex flex-row items-center justify-between gap-4 mb-2 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative group">
                  <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-colors ${theme === 'light' ? 'bg-white/60 border-blue-100 text-blue-600' : 'bg-gray-900/50 border-gray-800/50 text-amber-400'}`}>
                    <TimeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-colors ${theme === 'light' ? 'bg-white/60 border-blue-100' : 'bg-gray-900/50 border-gray-800/50'}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Volume2 className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                    <div className={`w-12 sm:w-24 h-1 rounded-full overflow-hidden ${theme === 'light' ? 'bg-blue-50' : 'bg-gray-800'}`}>
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${ambientSound}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInterface(!showInterface)} className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 group ${theme === 'light' ? 'bg-white/60 border-blue-100 hover:border-blue-300' : 'bg-gray-900/50 border-gray-800/50 hover:border-blue-500/30'}`}>
                <Cpu className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${theme === 'light' ? 'text-blue-400 group-hover:text-blue-600' : 'text-gray-400 group-hover:text-blue-400'}`} />
              </button>
            </div>

            <div className="relative">
              <div className={`absolute -inset-4 rounded-3xl blur-2xl ${theme === 'light' ? 'bg-blue-600/5' : 'bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-purple-600/10'}`} />
              <div className="relative max-w-3xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2 sm:mb-6">
                  <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border backdrop-blur-md ${theme === 'light' ? 'bg-blue-600/5 border-blue-100' : 'bg-red-600/10 border-red-500/30'}`}>
                    <span className={`${theme === 'light' ? 'text-blue-600' : 'text-red-500'} text-[8px] sm:text-xs font-black tracking-[0.2em] uppercase animate-pulse`}>Premium Ultra Pro</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] lg:leading-[0.95] mb-2 sm:mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent uppercase" style={{ backgroundSize: "200% auto", animation: "hologram 3s ease-in-out infinite" }}>
                    {t("hero.title").includes(",") ? t("hero.title").split(",")[0] : t("hero.title")}
                  </span>
                </h1>
                <p className={`text-sm sm:text-xl lg:text-2xl font-light tracking-wide leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{t("hero.subtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-12">
              {[
                { label: t("hero.stats.speed"), value: carSpeed, unit: "km/h", icon: Gauge, color: "from-red-500 to-orange-500", progress: (carSpeed/320)*100 },
                { label: t("hero.stats.energy"), value: energyLevel, unit: "%", icon: BatteryCharging, color: "from-green-500 to-emerald-500", progress: energyLevel },
                { label: t("hero.stats.temp"), value: "22", unit: "°C", icon: Thermometer, color: "from-cyan-500 to-blue-500", progress: 70 },
              ].map((stat, i) => (
                <div key={i} className={`relative p-2 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-lg border transition-all ${theme === 'light' ? 'bg-white border-blue-50 shadow-xl' : 'bg-gray-900/30 border-gray-800/50'} ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <div className={`p-1 sm:p-2 rounded-lg bg-gradient-to-r ${stat.color}`}><stat.icon className="w-3 h-3 sm:w-5 sm:h-5 text-white" /></div>
                    <span className="text-[7px] sm:text-[10px] font-black uppercase text-gray-400">{stat.label}</span>
                  </div>
                  <div className={`text-lg sm:text-3xl font-black ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{stat.value}<span className="text-[8px] sm:text-xs ml-1 text-gray-500">{stat.unit}</span></div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 lg:mt-10">
              <div className={`p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] backdrop-blur-xl border ${theme === 'light' ? 'bg-white/80 border-blue-50 shadow-2xl' : 'bg-gray-900/40 border-gray-800/50'}`}>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                   {[Navigation, Bluetooth, Satellite, Wind, Droplets, Cloud].map((Icon, i) => (
                     <button key={i} className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-center ${theme === 'light' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-900/20 border-blue-500/30 text-blue-400'}`}>
                       <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                     </button>
                   ))}
                </div>
                <div className="mt-4 sm:mt-8 flex justify-center gap-4 sm:gap-6">
                   <button className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-full"><SkipBack size={16} className="sm:w-5 sm:h-5" /></button>
                   <button onClick={handlePlaySound} className="p-3 sm:p-6 bg-blue-600 text-white rounded-full shadow-xl">{isPlaying ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}</button>
                   <button className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-full"><SkipForward size={16} className="sm:w-5 sm:h-5" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 mt-12 lg:mt-0 flex flex-col items-center">
            {/* Thumbnails Container - Moved to Relative to avoid overlap */}
            <div className="relative flex gap-2 sm:gap-4 z-30 mb-4 sm:mb-8 justify-center overflow-hidden p-2">
              {currentCars.map((car, i) => (
                <button key={car._id || i} onClick={() => setActiveCar(i)} className={`w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-2xl overflow-hidden border sm:border-4 transition-all ${activeCar === i ? 'border-blue-600 scale-110 shadow-2xl' : 'border-white/10 opacity-50'}`}>
                  <img src={car.image || car.images?.[0]} className="w-full h-full object-cover" alt={car.name} />
                </button>
              ))}
            </div>
            
            <div className={`relative w-full rounded-3xl sm:rounded-[4rem] overflow-hidden border sm:border-4 transition-all ${theme === 'light' ? 'bg-white border-blue-50 shadow-3xl' : 'bg-black border-blue-600/20'}`}>
               <img src={activeCarData.image || activeCarData.images?.[0]} className="w-full h-[200px] sm:h-[500px] object-cover" alt={activeCarData.name} />
               <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10">
                  <h3 className="text-xl sm:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{activeCarData.brand} {activeCarData.model}</h3>
                  <p className="text-blue-400 font-black text-sm sm:text-2xl uppercase">{activeCarData.pricePerDay} DH / JOUR</p>
               </div>
            </div>
            <div className="absolute -bottom-4 sm:-bottom-10 left-0 right-0 lg:left-auto lg:right-10 flex justify-center lg:justify-end gap-2 sm:gap-4 px-4 sm:px-0">
               <button onClick={() => onExplore(activeCarData._id)} className="flex-1 lg:flex-none px-4 sm:px-10 py-3 sm:py-5 bg-white text-blue-600 font-black rounded-xl sm:rounded-3xl shadow-2xl uppercase tracking-widest text-[8px] sm:text-xs">Explorer</button>
               <button onClick={() => onBook(activeCarData._id)} className="flex-1 lg:flex-none px-6 sm:px-12 py-3 sm:py-5 bg-blue-600 text-white font-black rounded-xl sm:rounded-3xl shadow-2xl uppercase tracking-widest text-[8px] sm:text-xs">Réserver</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hologram { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes neural { 0% { stroke-dashoffset: 1000; } 100% { stroke-dashoffset: 0; } }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        @keyframes quantumFloat { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, -20px); } }
        @keyframes beamSweep { 0% { transform: rotate(45deg) translateY(-100%); } 100% { transform: rotate(45deg) translateY(100vh); } }
        @keyframes quantumPulse { 0%, 100% { height: 50px; } 50% { height: 90px; } }
        .perspective-2000 { perspective: 2000px; }
      `}</style>
    </section>
  );
};
