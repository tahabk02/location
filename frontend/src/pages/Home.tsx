import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import {
  ChevronDown,
  Home as HomeIcon,
  Calendar,
  Heart,
  Search,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  Thermometer,
  MapPin,
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Phone,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Cars } from "../components/Cars";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { settingsService } from "../services/api";

// Types
interface Notification {
  id: number;
  message: string;
  type: "info" | "promo" | "update" | "success" | "warning";
  icon: string;
  time: string;
  read: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideoUrl, setGalleryVideoUrl] = useState<string>("");
  const [agencySettings, setAgencySettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const headerY = useTransform(scrollY, [0, 100], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    const fetchSettings = async () => {
      try {
        const settings = await settingsService.get();
        setGalleryImages(settings.galleryImages || []);
        setGalleryVideoUrl(settings.galleryVideoUrl || "");
        setAgencySettings(settings || {});
      } catch (err) {
        console.error("Error loading gallery settings:", err);
      }
    };
    fetchSettings();

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Bienvenue sur LuxeDrive Premium",
      type: "info",
      icon: "Sparkles",
      time: "Maintenant",
      read: false,
    },
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate("/cars");
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const trimmedUrl = url.trim();
    const match = trimmedUrl.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const defaultGalleryImages = [
    "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
    "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
    "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
    "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg",
  ];

  const galleryImageSources = galleryImages.length
    ? galleryImages
    : defaultGalleryImages;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-all duration-500 overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Header */}
      <motion.div
        style={{ y: headerY, opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <Header
          onSearch={handleSearch}
          user={user}
          notifications={notifications}
          isMobile={isMobile}
        />
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10">
        <section id="hero">
          <Hero
            onBook={() => navigate("/cars")}
            onExplore={() => navigate("/cars")}
            isMobile={isMobile}
          />
        </section>

        <section id="gallery" className="py-20 bg-gray-100 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black dark:text-white">
                {t("gallery.title")}
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                {t("gallery.subtitle")}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="grid gap-6 sm:grid-cols-2">
                {galleryImageSources.map((src, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20"
                  >
                    <img
                      src={src}
                      alt={`Galerie ${index + 1}`}
                      className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Vidéo de présentation
                  </h3>
                  <div className="overflow-hidden rounded-3xl bg-black shadow-inner">
                    {galleryVideoUrl ? (
                      (() => {
                        const embedUrl = getYoutubeEmbedUrl(galleryVideoUrl);
                        if (embedUrl) {
                          return (
                            <iframe
                              title="Galerie Vidéo"
                              src={embedUrl}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="h-[360px] w-full"
                            />
                          );
                        }
                        if (galleryVideoUrl.endsWith(".mp4") || galleryVideoUrl.endsWith(".webm")) {
                          return (
                            <video
                              controls
                              poster="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"
                              className="h-[360px] w-full object-cover"
                            >
                              <source src={galleryVideoUrl} type="video/mp4" />
                              Votre navigateur ne supporte pas la vidéo HTML5.
                            </video>
                          );
                        }
                        return (
                          <div className="p-10 text-center text-white">
                            <p className="mb-4">L'URL de la vidéo n'est pas compatible.</p>
                            <a href={galleryVideoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all">
                              <Play className="w-4 h-4" /> Voir sur YouTube
                            </a>
                          </div>
                        );
                      })()
                    ) : (
                      <video
                        controls
                        poster="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"
                        className="h-[360px] w-full object-cover"
                      >
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                      </video>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Notre collection</h3>
                  <p className="text-gray-600 dark:text-gray-300">Ces images présentent les véhicules premium disponibles à la location.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-blue-50 p-4 dark:bg-blue-900/30">
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{galleryImageSources.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Images de galerie</p>
                    </div>
                    <div className="rounded-3xl bg-green-50 p-4 dark:bg-emerald-900/30">
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{galleryVideoUrl ? 1 : 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vidéo immersive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cars" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-12 dark:text-white">{t("cars.title")}</h2>
            <Cars
              searchQuery={searchQuery}
              onCarSelect={(id) => navigate(`/car/${id}`)}
              isMobile={isMobile}
            />
          </div>
        </section>

        <section id="features">
          <Features isMobile={isMobile} />
        </section>

        {/* Map Section */}
        <section id="location" className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-black dark:text-white mb-4">
                    Trouvez-nous à <span className="text-blue-600">Casablanca</span>
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                    Notre showroom est idéalement situé sur le Boulevard d'Anfa, 
                    au cœur du quartier des affaires de Casablanca.
                  </p>
                </div>

                <div className="grid gap-6">
                  {[
                    { icon: MapPin, title: t("footer.address"), detail: agencySettings.address || "Boulevard d'Anfa, Casablanca, Maroc", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: Phone, title: t("footer.phone"), detail: agencySettings.phone || "+212 600 000 000", color: "text-green-500", bg: "bg-green-500/10" },
                    { icon: Globe, title: t("footer.email"), detail: agencySettings.email || "contact@luxedrive.ma", color: "text-purple-500", bg: "bg-purple-500/10" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-all">
                      <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.title}</h4>
                        <p className="text-lg font-bold dark:text-white">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-900 aspect-square lg:aspect-video"
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8463833446056!2d-7.6346766!3d33.5833481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d2925920399d%3A0x67394f4c9a8f6d62!2sBd%20d&#39;Anfa%2C%20Casablanca!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma" 
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" 
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
