import {
  Menu,
  X,
  Moon,
  Sun,
  Car,
  Sparkles,
  ChevronDown,
  Zap,
  Navigation,
  Shield,
  Clock,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: any;
  notifications?: any[];
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const particlesRef = useRef<
    Array<{ x: number; y: number; size: number; speed: number }>
  >([]);

  useEffect(() => {
    particlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
    }));
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
      setScrollProgress(Math.min(scrollY / 200, 1));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        setCursorPosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        particlesRef.current = particlesRef.current.map((particle) => ({
          ...particle,
          x: (particle.x + particle.speed) % 100,
          y: (particle.y + particle.speed * 0.5) % 100,
        }));
      }
    };

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 100);
      }
    }, 3000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleNavAction = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 200);
    } else {
      scrollToSection(id);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const handleAuthAction = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      navigate(storedUser.role === "admin" ? "/admin" : "/client");
    } else {
      navigate("/login");
    }
  };

  const { language, setLanguage, t, isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const navItems = [
    { id: "hero", label: t("nav.home"), icon: <Navigation className="w-4 h-4" /> },
    { id: "cars", label: t("nav.cars"), icon: <Car className="w-4 h-4" /> },
    { id: "features", label: t("nav.features"), icon: <Shield className="w-4 h-4" /> },
    { id: "gallery", label: t("nav.gallery"), icon: <Sparkles className="w-4 h-4" /> },
  ];

  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
  }));

  const headerStyle = {
    transform: `translateY(${scrollProgress * -5}px) scale(${1 - scrollProgress * 0.02})`,
    transition: "all 0.3s ease-out",
  };

  return (
    <header
      ref={headerRef}
      style={headerStyle}
      className={`fixed top-0 w-full z-50 transition-all duration-700 ${glitchEffect ? "glitch-effect" : ""} ${isLoading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-blue-400/20 dark:bg-cyan-400/30"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative transition-all duration-700 ${scrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl py-2" : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg py-4"}`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer group relative"
              onClick={() => handleNavAction("hero")}
              onMouseEnter={() => setIsHoveringLogo(true)}
              onMouseLeave={() => setIsHoveringLogo(false)}
            >
              <Car className="w-10 h-10 text-blue-600 dark:text-cyan-400" />
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                LuxeDrive
              </span>
            </div>

            <div className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavAction(item.id)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {item.label}
                </button>
              ))}

              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-4" />

              {/* Language Switcher */}
              <div className="relative flex items-center gap-1 mr-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                {(["fr", "en", "ar"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                      language === lang
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 mr-4"
              >
                {theme === "light" ? (
                  <Moon className="w-6 h-6" />
                ) : (
                  <Sun className="w-6 h-6 text-yellow-400" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAuthAction}
                    className="p-3 rounded-2xl btn-glass-primary flex items-center gap-2"
                  >
                    <User className="w-6 h-6" />
                    <span className="font-bold">
                      {user.role === "admin" ? t("nav.admin_space") : t("nav.client_space")}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-3 rounded-2xl btn-glass flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">{t("nav.logout")}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="p-3 rounded-2xl btn-glass-primary flex items-center gap-2"
                >
                  <User className="w-6 h-6" />
                  <span className="font-bold">{t("nav.client_space")}</span>
                </button>
              )}
            </div>

            <div className="xl:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="xl:hidden mt-4 pb-4 space-y-4">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-gray-500 ml-2">Language</span>
                <div className="flex gap-1">
                  {(["fr", "en", "ar"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                        language === lang
                          ? "bg-blue-600 text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavAction(item.id)}
                    className="w-full text-left px-4 py-3 rounded-xl btn-glass flex items-center gap-3"
                  >
                    {item.icon}
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={handleAuthAction}
                    className="w-full text-center px-4 py-3 rounded-xl btn-glass-primary font-bold"
                  >
                    {user.role === "admin" ? t("nav.admin_space") : t("nav.client_space")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-3 rounded-xl btn-glass font-bold text-red-500"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="w-full text-center px-4 py-3 rounded-xl btn-glass-primary font-bold"
                >
                  {t("nav.client_space")}
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .glitch-effect { animation: glitch 0.1s linear infinite; }
        @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-1px, 1px); } 100% { transform: translate(0); } }
      `}</style>
    </header>
  );
};
