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
  Car,
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
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

interface HeroProps {
  onBook: () => void;
  onExplore: () => void;
  isMobile?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onBook, onExplore, isMobile }) => {
  const { t, isRTL } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  // ... rest of state ...

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCar, setActiveCar] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [isPlaying, setIsPlaying] = useState(false);
  const [carSpeed, setCarSpeed] = useState(0);
  const [ambientSound, setAmbientSound] = useState(30);
  const [showInterface, setShowInterface] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(85);
  const heroRef = useRef(null);

  const cars = [
    {
      name: "Tesla Model S Plaid",
      price: "1000 DH",
      image:
        "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
      specs: {
        power: "1020ch",
        range: "637km",
        acceleration: "2.1s",
        topSpeed: "322km/h",
      },
      color: "from-blue-600 to-cyan-600",
      type: "ÉLECTRIQUE",
      sound: "electric",
      interior:
        "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
    },
    {
      name: "Porsche 911 Turbo S",
      price: "199 DH",
      image: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
      specs: {
        power: "650ch",
        range: "—",
        acceleration: "2.7s",
        topSpeed: "330km/h",
      },
      color: "from-red-600 to-orange-600",
      type: "PERFORMANCE",
      sound: "sport",
      interior:
        "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg",
    },
    {
      name: "Mercedes Maybach",
      price: "299 DH",
      image: "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
      specs: {
        power: "630ch",
        range: "—",
        acceleration: "4.8s",
        topSpeed: "250km/h",
      },
      color: "from-amber-600 to-yellow-600",
      type: "LUXE",
      sound: "luxury",
      interior:
        "https://images.pexels.com/photos/193955/pexels-photo-193955.jpeg",
    },
  ];

  // Définir handlePlaySound avant de l'utiliser
  const handlePlaySound = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger Web Audio API
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

    // Simulate car speed animation
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
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const handleKeyPress = (e) => {
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
    switch (timeOfDay) {
      case "day":
        return "from-blue-900/30 via-cyan-900/20 to-blue-900/30";
      case "sunset":
        return "from-orange-900/40 via-red-900/30 to-purple-900/40";
      case "night":
        return "from-indigo-900/50 via-purple-900/40 to-gray-900/50";
      case "sunrise":
        return "from-pink-900/40 via-yellow-900/30 to-blue-900/40";
      default:
        return "from-blue-900/30 via-cyan-900/20 to-blue-900/30";
    }
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case "day":
        return Sun;
      case "sunset":
        return Sunset;
      case "night":
        return Moon;
      case "sunrise":
        return Sunrise;
      default:
        return Sun;
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

  const neuralPaths = useMemo(() => 
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      d: `M${Math.random() * 100} ${Math.random() * 100} Q${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100}`,
      delay: i * 0.3
    })), []);

  const quantumParticles = useMemo(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      color: `rgba(${59 + Math.random() * 196}, ${130 + Math.random() * 126}, ${246 + Math.random() * 10}, ${0.1 + Math.random() * 0.3})`,
      animation: getParticleAnimation(i),
      opacity: Math.random() * 0.5 + 0.1,
    })), []);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950"
    >
      {/* Dynamic Time of Day Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-2000 ${getTimeOfDayGradient()} z-0`}
      ></div>

      {/* Advanced Holographic Interface */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-1000 ${
          showInterface ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Holographic grid with depth */}
        <div className="absolute inset-0 perspective-2000">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]"
            style={{
              transform: `translateZ(${mousePosition.y * 0.5}px) rotateX(${
                mousePosition.y * 0.1
              }deg) rotateY(${mousePosition.x * 0.1}deg)`,
            }}
          />
        </div>

        {/* Neural network connections */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="neural-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Animated neural paths */}
          {neuralPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              fill="none"
              stroke="url(#neural-gradient)"
              strokeWidth="0.5"
              strokeDasharray="5,5"
              style={{
                animation: `neural 8s linear infinite`,
                animationDelay: `${path.delay}s`,
              }}
              filter="url(#glow)"
            />
          ))}
        </svg>
      </div>

      {/* Quantum Particles System */}
      <div className="absolute inset-0 overflow-hidden">
        {quantumParticles.map((particle) => {
          return (
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
                opacity: particle.opacity,
              }}
            />
          );
        })}
      </div>

      {/* Dynamic Light Beams */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-64 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent rotate-45"
            style={{
              left: `${(i / 8) * 100}%`,
              animation: getBeamAnimation(i),
              transformOrigin: "top center",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Column - Enhanced Interface */}
          <div className="space-y-10">
            {/* Time and Environment Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="p-3 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-gray-800/50">
                    <TimeIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 px-3 py-1 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                  </div>
                </div>

                {/* Ambient Sound Control */}
                <div className="relative group">
                  <div className="px-4 py-3 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-blue-400" />
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                            style={{ width: `${ambientSound}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-8">
                          {ambientSound}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface Toggle */}
              <button
                onClick={() => setShowInterface(!showInterface)}
                className="px-4 py-3 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <Cpu className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>

            {/* Main Title with Holographic Effect */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>

              <div className="relative">
                <h1 className="text-8xl md:text-9xl font-bold leading-[0.85] mb-6">
                  <span className="block">
                    <span className="relative inline-block">
                      <span
                        className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent uppercase"
                        style={{
                          backgroundSize: "200% auto",
                          animation: "hologram 3s ease-in-out infinite",
                        }}
                      >
                        {t("hero.title").split(",")[0] || "NEXUS"}
                      </span>
                      <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-violet-500 rounded-full animate-pulse"></div>
                    </span>
                  </span>
                  <span className="block mt-4">
                    <span className="text-white/90 font-light tracking-wider uppercase">
                      {t("hero.title").split(",")[1] || "AUTOMOTIVE"}
                    </span>
                  </span>
                </h1>

                {/* Title Particles */}
                <div className="absolute -top-4 -right-4 flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-blue-400 rounded-full"
                      style={{
                        animation: `bounce 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Animated Subtitle */}
              <div className="mt-8 overflow-hidden">
                <div className="inline-block">
                  <p
                    className="text-2xl text-gray-300 font-light tracking-wide"
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      animation: "typewriter 3s steps(40) 1s normal both",
                    }}
                  >
                    {t("hero.subtitle")}
                  </p>
                  <div className="h-px w-full bg-gradient-to-r from-blue-500/50 via-transparent to-blue-500/50 mt-2"></div>
                </div>
              </div>
            </div>

            {/* Dynamic Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                {
                  label: isRTL ? "السرعة" : "Vitesse",
                  value: `${carSpeed}`,
                  unit: "km/h",
                  icon: Gauge,
                  color: "from-red-500 to-orange-500",
                  progress: (carSpeed / 320) * 100,
                },
                {
                  label: isRTL ? "الطاقة" : "Énergie",
                  value: `${energyLevel}`,
                  unit: "%",
                  icon: BatteryCharging,
                  color: "from-green-500 to-emerald-500",
                  progress: energyLevel,
                },
                {
                  label: isRTL ? "الحرارة" : "Température",
                  value: "22",
                  unit: "°C",
                  icon: Thermometer,
                  color: "from-cyan-500 to-blue-500",
                  progress: 70,
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-5 rounded-2xl bg-gray-900/30 backdrop-blur-lg border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {stat.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <div className="text-3xl font-bold text-white">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-400">{stat.unit}</div>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gray-700 to-gray-500 rounded-full transition-all duration-500"
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Control Panel */}
            <div className="mt-10">
              <div className="p-6 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Contrôles Intelligents
                  </h3>
                  <div className="flex items-center gap-2">
                    <Wifi
                      className="w-4 h-4 text-green-500"
                      style={{ animation: "pulse 2s ease-in-out infinite" }}
                    />
                    <span className="text-sm text-green-400">Connecté</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Navigation, label: "Navigation", active: true },
                    { icon: Bluetooth, label: "Connectivité", active: true },
                    { icon: Satellite, label: "GPS Premium", active: true },
                    { icon: Wind, label: "Climatisation", active: true },
                    { icon: Droplets, label: "Purificateur", active: false },
                    { icon: Cloud, label: "Météo", active: true },
                  ].map((control, index) => {
                    const Icon = control.icon;
                    return (
                      <button
                        key={index}
                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ${
                          control.active
                            ? "bg-blue-900/20 border border-blue-500/30 hover:bg-blue-900/30"
                            : "bg-gray-900/20 border border-gray-800 hover:bg-gray-900/30"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            control.active ? "text-blue-400" : "text-gray-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            control.active ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {control.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Media Controls */}
                <div className="mt-6 pt-6 border-t border-gray-800/50">
                  <div className="flex items-center justify-center gap-6">
                    <button className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                      <SkipBack className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={handlePlaySound}
                      className="relative p-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 group"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </button>
                    <button className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                      <SkipForward className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quantum Car Display */}
          <div className="relative">
            {/* Car Selection Orbital System */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30">
              <div className="relative w-64 h-64">
                {cars.map((car, index) => {
                  const angle = (index / cars.length) * Math.PI * 2;
                  const radius = 100;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveCar(index)}
                      className={`absolute w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-110 ${
                        activeCar === index
                          ? "border-blue-500 scale-110 shadow-2xl shadow-blue-500/30"
                          : "border-gray-800/50"
                      }`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}

                {/* Orbital Ring */}
                <div
                  className="absolute inset-0 border border-blue-500/10 rounded-full"
                  style={{ animation: "spin-slow 30s linear infinite" }}
                ></div>
              </div>
            </div>

            {/* Main Car Hologram */}
            <div className="relative mt-40">
              {/* Holographic Base */}
              <div className="absolute -inset-8">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-[3rem] blur-3xl"
                  style={{ animation: "pulse 4s ease-in-out infinite" }}
                ></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2)_0%,transparent_50%)] rounded-[3rem]"></div>
              </div>

              {/* Car with Holographic Effect */}
              <div className="relative rounded-[2rem] overflow-hidden border-2 border-blue-500/20 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl">
                {/* Holographic Scan Lines */}
                <div className="absolute inset-0 z-10 opacity-20">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
                      style={{
                        top: `${(i / 20) * 100}%`,
                        animation: getScanAnimation(i),
                      }}
                    />
                  ))}
                </div>

                {/* Car Image with Depth */}
                <div className="relative h-[500px] overflow-hidden">
                  <img
                    src={cars[activeCar].image}
                    alt={cars[activeCar].name}
                    className="w-full h-full object-cover transform-gpu transition-all duration-1000"
                    style={{
                      transform: `translateZ(${
                        mousePosition.y * 0.2
                      }px) rotateY(${mousePosition.x * 0.02}deg)`,
                    }}
                  />

                  {/* Holographic Data Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  {/* Dynamic Specs Display */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(cars[activeCar].specs).map(
                        ([key, value], index) => (
                          <div
                            key={key}
                            className="transform transition-all duration-500"
                            style={{
                              transform: `translateY(${isLoaded ? 0 : 20}px)`,
                              opacity: isLoaded ? 1 : 0,
                              transitionDelay: `${index * 100}ms`,
                            }}
                          >
                            <div className="text-sm text-gray-400 mb-1">
                              {key.toUpperCase()}
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {value}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Holographic Controls */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                  {[
                    { icon: RefreshCw, action: () => setEnergyLevel(100) },
                    { icon: Target, action: () => setCarSpeed(0) },
                    { icon: Shield, action: () => {} },
                  ].map((control, index) => {
                    const Icon = control.icon;
                    return (
                      <button
                        key={index}
                        onClick={control.action}
                        className="p-3 rounded-xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300 group"
                      >
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Floating Price Tag with Quantum Animation */}
              <div className="absolute -bottom-6 -right-6 z-30">
                <div className="relative group">
                  <div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-70 transition-all duration-1000"
                    style={{
                      animation: "quantum-glow 2s ease-in-out infinite",
                    }}
                  ></div>
                  <div className="relative px-10 py-8 bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-gray-800/50">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">
                        <span
                          className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent"
                          style={{
                            backgroundSize: "200% auto",
                            animation: "hologram-text 4s ease-in-out infinite",
                          }}
                        >
                          {cars[activeCar].price}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm mb-4">
                        / JOUR • TOUT INCLUS
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <InfinityIcon className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-400">
                            Illimité
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-400">
                            Assurance
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-gray-400">Premium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Specifications Hologram */}
            <div className="mt-16 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-2xl"></div>
              <div className="relative p-6 rounded-3xl bg-gray-900/30 backdrop-blur-xl border border-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Spécifications Quantiques
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
                    <span className="text-xs text-blue-400">ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
                    <div className="text-sm text-gray-400 mb-2">
                      IA INTÉGRÉE
                    </div>
                    <div className="text-white font-semibold">
                      Nexus Core v2.1
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
                    <div className="text-sm text-gray-400 mb-2">
                      CONNECTIVITÉ
                    </div>
                    <div className="text-white font-semibold">5G Quantum</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Interface Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                ></div>
                <span className="text-sm text-gray-400">Système actif</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                ></div>
                <span className="text-sm text-gray-400">
                  Connecté au réseau
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onExplore}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <span className="text-sm text-blue-400 group-hover:text-white transition-colors">
                  EXPLORER LE CATALOGUE
                </span>
              </button>
              <button
                onClick={onBook}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all"
              >
                RÉSERVER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Sound Visualization */}
      <div className="absolute bottom-32 left-0 right-0 h-32 overflow-hidden opacity-10">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-1 bg-gradient-to-t from-blue-500 via-cyan-500 to-transparent rounded-t-lg"
            style={{
              left: `${(i / 40) * 100}%`,
              height: `${Math.sin(i * 0.2 + Date.now() * 0.01) * 40 + 50}px`,
              opacity: 0.5 + Math.sin(i * 0.1) * 0.3,
              animation: getQuantumPulseAnimation(i),
            }}
          />
        ))}
      </div>

      {/* Style tags corrigés - sans attribut jsx={true} */}
      <style>
        {`
        @keyframes hologram {
          0%, 100% { 
            opacity: 1;
            text-shadow: 
              0 0 10px rgba(59, 130, 246, 0.5),
              0 0 20px rgba(59, 130, 246, 0.3),
              0 0 30px rgba(59, 130, 246, 0.1);
          }
          50% { 
            opacity: 0.8;
            text-shadow: 
              0 0 20px rgba(59, 130, 246, 0.7),
              0 0 40px rgba(59, 130, 246, 0.5),
              0 0 60px rgba(59, 130, 246, 0.3);
          }
        }

        @keyframes hologram-text {
          0%, 100% { 
            background-position: 0% 50%;
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
          }
          50% { 
            background-position: 100% 50%;
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
          }
        }

        @keyframes quantumFloat {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.1;
          }
          25% { 
            transform: translate(10px, -20px) rotate(90deg);
            opacity: 0.3;
          }
          50% { 
            transform: translate(-15px, -40px) rotate(180deg);
            opacity: 0.1;
          }
          75% { 
            transform: translate(20px, -20px) rotate(270deg);
            opacity: 0.3;
          }
        }

        @keyframes beamSweep {
          0% { transform: rotate(45deg) translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(45deg) translateY(100vh); opacity: 0; }
        }

        @keyframes neural {
          0% { stroke-dashoffset: 1000; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes quantumPulse {
          0%, 100% { 
            height: 50px;
            opacity: 0.5;
          }
          50% { 
            height: 90px;
            opacity: 1;
          }
        }

        @keyframes typewriter {
          0% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes quantum-glow {
          0%, 100% { 
            opacity: 0.3;
            box-shadow: 
              0 0 30px rgba(59, 130, 246, 0.3),
              inset 0 0 30px rgba(59, 130, 246, 0.1);
          }
          50% { 
            opacity: 0.7;
            box-shadow: 
              0 0 60px rgba(59, 130, 246, 0.5),
              inset 0 0 60px rgba(59, 130, 246, 0.2);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .perspective-2000 {
          perspective: 2000px;
        }

        .transform-gpu {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .backdrop-blur-2xl {
          backdrop-filter: blur(48px);
        }

        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .duration-2000 {
          transition-duration: 2000ms;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}
      </style>
    </section>
  );
};
