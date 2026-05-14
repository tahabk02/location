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
  Globe,
  Image as ImageIcon,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { notificationService } from "../services/api";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    role: "superadmin" | "admin" | "client";
  } | null;
  onSearch?: (query: string) => void;
  notifications?: any[];
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      try {
        const data = await notificationService.getAdmin();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const navLinks = useMemo(() => [
    { id: "hero", label: t("nav.home"), icon: Sparkles },
    { id: "cars", label: t("nav.cars"), icon: Car },
    { id: "features", label: t("nav.features"), icon: Zap },
    { id: "gallery", label: t("nav.gallery"), icon: ImageIcon },
  ], [t]);

  const languages = useMemo(() => [
    { code: "fr", label: "Français", flag: "FR" },
    { code: "en", label: "English", flag: "EN" },
    { code: "ar", label: "الدارجة", flag: "AR" },
  ], []);

  const handleNavClick = useCallback((id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
    
    if (location.pathname !== "/") {
      navigate("/#" + id);
      return;
    }

    // Smooth scroll with precise offset
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, [location.pathname, navigate]);

  // Handle hash scroll after navigation
  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }
  }, [location]);

  const currentLang = useMemo(() => languages.find(l => l.code === language) || languages[0], [languages, language]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled
          ? "py-2 sm:py-4 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl shadow-2xl border-b border-gray-100 dark:border-gray-800"
          : "py-4 sm:py-6 bg-transparent"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between relative">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2 sm:gap-4 cursor-pointer group"
            onClick={() => handleNavClick("hero")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white/50 dark:bg-white p-0.5 rounded-lg overflow-hidden transition-all duration-500 group-hover:scale-105">
                <img 
                  src="/logo.jpeg" 
                  alt="AVENIR KAMIL CAR" 
                  className="h-8 w-auto sm:h-10 object-contain mix-blend-multiply dark:mix-blend-normal" 
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg md:text-xl font-black tracking-tighter text-gray-950 dark:text-white leading-none uppercase">
                AVENIR KAMIL <span className="text-red-600">CAR</span>
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mt-0.5 sm:mt-1">
                Premium Ultra Pro
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
                  activeTab === link.id
                    ? "text-white"
                    : "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                }`}
              >
                {activeTab === link.id && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon
                  size={16}
                  className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === link.id ? "text-white" : ""
                  }`}
                />
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Notifications (Admin only) */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-500 relative"
                >
                  <Bell size={16} className="sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest dark:text-white">Notifications</span>
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline">Tout marquer lu</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                  <Bell size={14} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] sm:text-xs font-bold dark:text-gray-300 leading-tight mb-1">{n.message}</p>
                                  <p className="text-[8px] font-black text-gray-400 uppercase">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Aucune notification</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 transition-all group"
              >
                <Globe size={16} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700 sm:w-[18px] sm:h-[18px]" />
                <span className="text-[10px] sm:text-xs font-black uppercase dark:text-white">{currentLang.flag}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''} sm:w-[14px] sm:h-[14px]`} />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden p-1.5"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          language === lang.code
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className={lang.code === "ar" ? "font-arabic" : ""}>{lang.label}</span>
                        <span className="text-[10px] font-black opacity-50">{lang.flag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-500"
            >
              {theme === "dark" ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
            </button>

            {/* User Access */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => (window.location.href = user.role === "admin" ? "/admin" : "/client")}
                  className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <User size={18} />
                  <span>{user.role === "admin" ? t("nav.admin_space") : t("nav.client_space")}</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                  className="p-2 sm:p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                  title={t("nav.logout")}
                >
                  <LogOut size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-gray-950 dark:bg-white dark:text-gray-950 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <span>{t("auth.login_tab")}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 sm:p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl"
          >
            <div className="container mx-auto px-4 py-8 space-y-6">
              {/* Navigation Links */}
              <div className="grid grid-cols-1 gap-3">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      activeTab === link.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${activeTab === link.id ? "bg-white/20" : "bg-blue-600/10"}`}>
                        <link.icon className={`w-5 h-5 ${activeTab === link.id ? "text-white" : "text-blue-600"}`} />
                      </div>
                      <span className="font-bold uppercase tracking-wide text-sm">
                        {link.label}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${activeTab === link.id ? "text-white" : "text-gray-400"} -rotate-90`}
                    />
                  </button>
                ))}
              </div>

              {/* User Specific Actions */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                {user ? (
                  <>
                    <button
                      onClick={() => (window.location.href = user.role === "admin" ? "/admin" : "/client")}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-500/20"
                    >
                      <div className="p-2.5 bg-white/20 rounded-xl">
                        <User size={20} />
                      </div>
                      <span className="uppercase tracking-wide text-sm">
                        {user.role === "admin" ? t("nav.admin_space") : t("nav.client_space")}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("user");
                        window.location.href = "/";
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold"
                    >
                      <div className="p-2.5 bg-red-500/20 rounded-xl">
                        <LogOut size={20} />
                      </div>
                      <span className="uppercase tracking-wide text-sm">
                        {t("nav.logout")}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => (window.location.href = "/login")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black"
                  >
                    <div className="p-2.5 bg-white/10 dark:bg-gray-950/10 rounded-xl">
                      <Zap size={20} />
                    </div>
                    <span className="uppercase tracking-widest text-sm">
                      {t("auth.login_tab")}
                    </span>
                  </button>
                )}
              </div>

              {/* Theme & Language Quick Toggle for Mobile */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span className="text-xs uppercase">{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
