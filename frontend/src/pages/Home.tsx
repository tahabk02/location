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
  Mail,
  Shield,
  Star,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Cars } from "../components/Cars";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { settingsService, reviewService } from "../services/api";

// Types
interface Notification {
  id: number;
  message: string;
  type: "info" | "promo" | "update" | "success" | "warning";
  icon: string;
  time: string;
  read: boolean;
}

interface Review {
  _id?: string;
  name: string;
  date: string;
  comment: string;
  image: string;
  rating: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideoUrl, setGalleryVideoUrl] = useState<string>("");
  const [agencySettings, setAgencySettings] = useState<any>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showIntro, setShowIntro] = useState(true);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const headerY = useTransform(scrollY, [0, 100], [0, 0]);
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);

  useEffect(() => {
    // Check if intro was already shown in this session
    const introShown = sessionStorage.getItem("introShown");
    if (introShown) {
      setShowIntro(false);
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    const fetchSettings = async () => {
      try {
        const [settings, dbReviews] = await Promise.all([
          settingsService.get(),
          reviewService.getAll()
        ]);
        setGalleryImages(settings.galleryImages || []);
        setGalleryVideoUrl(settings.galleryVideoUrl || "");
        setAgencySettings(settings || {});
        setReviews(dbReviews || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      }
    };
    fetchSettings();

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSkipIntro = () => {
    setShowIntro(false);
    sessionStorage.setItem("introShown", "true");
  };

  const [introProgress, setIntroProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Failsafe: Automatically skip intro after 10 seconds even if video fails
    const failsafe = setTimeout(() => {
      if (showIntro) handleSkipIntro();
    }, 10000);

    if (showIntro && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.defaultMuted = true; // Essential for some browsers
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Autoplay blocked:", err);
          // If blocked, we skip immediately to not stay stuck
          handleSkipIntro();
        });
      }
    }

    return () => clearTimeout(failsafe);
  }, [showIntro]);

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setIntroProgress(progress);
    }
  };

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Bienvenue sur AVENIR KAMIL CAR",
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
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const galleryImageSources = useMemo(() => {
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages;
    }
    return [
      "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
      "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
      "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
      "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg",
    ];
  }, [galleryImages]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
            onClick={handleSkipIntro} // Tap anywhere to skip if stuck
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 z-0 bg-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0%,transparent_70%)] animate-pulse" />
              
              {/* Native video for better mobile support */}
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{
                  __html: `
                    <video
                      autoplay
                      muted
                      loop
                      playsinline
                      preload="auto"
                      class="w-full h-full object-cover relative z-10"
                      style="pointer-events: none;"
                    >
                      <source src="/intro.mp4" type="video/mp4" />
                    </video>
                  `
                }}
              />
            </div>

            {/* Cinematic Overlay UI */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-8 pointer-events-none">
              <div className="flex flex-col items-center gap-6">
                {/* Brand Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">
                    AVENIR KAMIL <span className="text-red-600">CAR</span>
                  </span>
                  <div className="h-1 w-1 rounded-full bg-red-600 animate-ping" />
                </motion.div>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Appuyez pour passer</p>
              </div>
            </div>

            {/* Cinematic Letterbox Effects */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent opacity-60 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-all duration-500 overflow-x-hidden">
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 z-[60] origin-left"
          style={{ scaleX }}
        />

        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          <Header
            onSearch={handleSearch}
            user={user}
            notifications={notifications}
            isMobile={isMobile}
          />
        </motion.div>

        <main className="relative z-10">
          <section id="hero">
            <Hero
              onBook={(carId) => navigate(`/car/${carId}`)}
              onExplore={(carId) => navigate(`/car/${carId}`)}
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
                        className="h-64 sm:h-72 w-full object-cover transition-transform duration-500 hover:scale-105"
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
                                className="h-[240px] sm:h-[320px] md:h-[360px] w-full"
                              />
                            );
                          }
                          if (
                            galleryVideoUrl.endsWith(".mp4") ||
                            galleryVideoUrl.endsWith(".webm")
                          ) {
                            return (
                              <video
                                controls
                                poster="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"
                                className="h-[240px] sm:h-[320px] md:h-[360px] w-full object-cover"
                              >
                                <source src={galleryVideoUrl} type="video/mp4" />
                                Votre navigateur ne supporte pas la vidéo HTML5.
                              </video>
                            );
                          }
                          return (
                            <div className="p-10 text-center text-white">
                              <p className="mb-4">
                                L'URL de la vidéo n'est pas compatible.
                              </p>
                              <a
                                href={galleryVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all"
                              >
                                <Play className="w-4 h-4" /> Voir sur YouTube
                              </a>
                            </div>
                          );
                        })()
                      ) : (
                        <video
                          controls
                          poster="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"
                          className="h-[240px] sm:h-[320px] md:h-[360px] w-full object-cover"
                        >
                          <source
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            type="video/mp4"
                          />
                        </video>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Notre collection
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ces images présentent les véhicules premium disponibles à la
                      location.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-blue-50 p-4 dark:bg-blue-900/30">
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {galleryImageSources.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Images de galerie
                        </p>
                      </div>
                      <div className="rounded-3xl bg-green-50 p-4 dark:bg-emerald-900/30">
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {galleryVideoUrl ? 1 : 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Vidéo immersive
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="cars" className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-black text-center mb-12 dark:text-white">
                {t("cars.title")}
              </h2>
              <Cars
                searchQuery={searchQuery}
                onCarSelect={(id) => navigate(`/car/${id}`)}
              />
            </div>
          </section>

          <section id="features">
            <Features />
          </section>

          {/* Google Reviews Section */}
          <section className="py-24 bg-gray-50 dark:bg-gray-900/30 overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-bold dark:text-white">4.9 / 5 sur Google</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black dark:text-white uppercase tracking-tighter">
                    Ce que disent nos <span className="text-red-600">clients</span>
                  </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 max-w-md text-right font-medium">
                  Découvrez les expériences de nos clients avec AVENIR KAMIL CAR.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {(reviews.length > 0 ? reviews.slice(0, 3) : [
                  {
                    name: "Yassine El Amrani",
                    date: "Il y a 2 semaines",
                    comment: "Service exceptionnel ! La voiture était dans un état impeccable, propre et sentait bon. L'équipe est très professionnelle et réactive. Je recommande vivement AVENIR KAMIL CAR pour vos locations à Casablanca.",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  },
                  {
                    name: "Sarah Bensouda",
                    date: "Il y a 1 mois",
                    comment: "Très bonne expérience. Réservation facile sur le site et livraison à l'heure pile à l'aéroport. Rapport qualité/prix imbattable pour des véhicules premium. Merci encore !",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                  },
                  {
                    name: "Mehdi Tazi",
                    date: "Il y a 3 mois",
                    comment: "Flotte de véhicules impressionnante. J'ai loué la Tesla pour un weekend, tout était parfait. Le personnel est accueillant et le processus de retour a été très rapide. Ultra Pro !",
                    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                  }
                ]).map((review, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                  >
                    <div className="mb-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                      <img src={review.image} alt={review.name} className="w-12 h-12 rounded-2xl object-cover" />
                      <div>
                        <h4 className="font-bold dark:text-white text-sm">{review.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{review.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 flex justify-center">
                <button className="flex items-center gap-3 px-8 py-4 bg-gray-950 dark:bg-white dark:text-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                  <span>Voir plus d'avis sur Google</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section
            id="location"
            className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden"
          >
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
                      Trouvez-nous à{" "}
                      <span className="text-blue-600">Casablanca</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                      Notre showroom est idéalement situé au 22, Boulevard de la Résistance,
                      au cœur du centre-ville de Casablanca.
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {[
                      {
                        icon: MapPin,
                        title: t("footer.address"),
                        detail:
                          agencySettings.address ||
                          "22, Boulevard de la Résistance, Casablanca, Maroc",
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                      },
                      {
                        icon: Phone,
                        title: t("footer.phone"),
                        detail: agencySettings.phone || "+212 600 000 000",
                        color: "text-green-500",
                        bg: "bg-green-500/10",
                      },
                      {
                        icon: Globe,
                        title: t("footer.email"),
                        detail: agencySettings.email || "contact@avenirkamilcar.ma",
                        color: "text-purple-500",
                        bg: "bg-purple-500/10",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-all"
                      >
                        <div
                          className={`p-4 rounded-2xl ${item.bg} ${item.color}`}
                        >
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-lg font-bold dark:text-white">
                            {item.detail}
                          </p>
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.9351403248677!2d-7.5774685848!3d33.54078878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda6330f63366145%3A0x1cac190898144283!2sAvenir%20Kamil%20location%20des%20voitures!5e0!3m2!1sfr!2sma!4v1715420000000!5m2!1sfr!2sma"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </motion.div>              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
