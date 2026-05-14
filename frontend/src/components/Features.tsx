import {
  Clock,
  Shield,
  Headphones,
  Award,
  Zap,
  Globe,
  Sparkles,
  CheckCircle,
  Star,
  TrendingUp,
  Cpu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { serviceService } from "../services/api";

const colorClasses: Record<
  string,
  {
    bg: string;
    icon: string;
    hover: string;
    gradient: string;
    shadow: string;
    light: string;
  }
> = {
  blue: {
    bg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/20 dark:from-blue-900/40 dark:to-cyan-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "group-hover:from-blue-600 group-hover:to-cyan-600",
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    light: "bg-blue-500/10",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500/10 to-green-500/20 dark:from-emerald-900/40 dark:to-green-900/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    hover: "group-hover:from-emerald-600 group-hover:to-green-600",
    gradient: "from-emerald-500 via-green-500 to-emerald-600",
    shadow: "shadow-emerald-500/20",
    light: "bg-emerald-500/10",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-500/10 to-purple-500/20 dark:from-violet-900/40 dark:to-purple-900/30",
    icon: "text-violet-600 dark:text-violet-400",
    hover: "group-hover:from-violet-600 group-hover:to-purple-600",
    gradient: "from-violet-500 via-purple-500 to-violet-600",
    shadow: "shadow-violet-500/20",
    light: "bg-violet-500/10",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-500/10 to-orange-500/20 dark:from-amber-900/40 dark:to-orange-900/30",
    icon: "text-amber-600 dark:text-amber-400",
    hover: "group-hover:from-amber-600 group-hover:to-orange-600",
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    shadow: "shadow-amber-500/20",
    light: "bg-amber-500/10",
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-500/10 to-rose-500/20 dark:from-pink-900/40 dark:to-rose-900/30",
    icon: "text-pink-600 dark:text-pink-400",
    hover: "group-hover:from-pink-600 group-hover:to-rose-600",
    gradient: "from-pink-500 via-rose-500 to-pink-600",
    shadow: "shadow-pink-500/20",
    light: "bg-pink-500/10",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-500/10 to-teal-500/20 dark:from-cyan-900/40 dark:to-teal-900/30",
    icon: "text-cyan-600 dark:text-cyan-400",
    hover: "group-hover:from-cyan-600 group-hover:to-teal-600",
    gradient: "from-cyan-500 via-teal-500 to-cyan-600",
    shadow: "shadow-cyan-500/20",
    light: "bg-cyan-500/10",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-500/10 to-blue-500/20 dark:from-indigo-900/40 dark:to-blue-900/30",
    icon: "text-indigo-600 dark:text-indigo-400",
    hover: "group-hover:from-indigo-600 group-hover:to-blue-600",
    gradient: "from-indigo-500 via-blue-500 to-indigo-600",
    shadow: "shadow-indigo-500/20",
    light: "bg-indigo-500/10",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-500/10 to-pink-500/20 dark:from-rose-900/40 dark:to-pink-900/30",
    icon: "text-rose-600 dark:text-rose-400",
    hover: "group-hover:from-rose-600 group-hover:to-pink-600",
    gradient: "from-rose-500 via-pink-500 to-rose-600",
    shadow: "shadow-rose-500/20",
    light: "bg-rose-500/10",
  },
  lime: {
    bg: "bg-gradient-to-br from-lime-500/10 to-green-500/20 dark:from-lime-900/40 dark:to-green-900/30",
    icon: "text-lime-600 dark:text-lime-400",
    hover: "group-hover:from-lime-600 group-hover:to-green-600",
    gradient: "from-lime-500 via-green-500 to-lime-600",
    shadow: "shadow-lime-500/20",
    light: "bg-lime-500/10",
  },
};

export const Features = () => {
  const { t, isRTL } = useLanguage();
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const particlesRef = useRef<
    Array<{ x: number; y: number; size: number; speed: number }>
  >([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceService.getAll();
        setDbServices(data || []);
      } catch (e) {
        console.error("Error fetching services", e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const defaultFeatures = useMemo(() => [
    {
      icon: Clock,
      title: isRTL ? "حجز فوري" : (t("nav.home") === "Home" ? "Immediate Booking" : "Réservation Immédiate"),
      description: isRTL ? "نظام حجز ذكي مع تأكيد فوري وإدارة في الوقت الفعلي" : (t("nav.home") === "Home" ? "Smart booking system with instant confirmation and real-time management" : "Système de réservation intelligent avec confirmation instantanée et gestion temps réel"),
      color: "blue" as const,
      stats: "98%",
      statLabel: isRTL ? "حجوزات تم تأكيدها في أقل من دقيقتين" : (t("nav.home") === "Home" ? "Bookings validated in < 2min" : "Réservations validées en < 2min"),
      highlights: [
        isRTL ? "توفر في الوقت الفعلي" : (t("nav.home") === "Home" ? "Real-time availability" : "Disponibilité temps réel"),
        isRTL ? "دفع آمن" : (t("nav.home") === "Home" ? "Secure payment" : "Paiement sécurisé"),
        isRTL ? "تأكيد عبر رسالة نصية" : (t("nav.home") === "Home" ? "SMS Confirmation" : "Confirmation SMS"),
      ],
      category: "logistics"
    },
    {
      icon: Shield,
      title: isRTL ? "حماية قصوى" : (t("nav.home") === "Home" ? "Ultimate Protection" : "Protection Ultime"),
      description: isRTL ? "تأمين شامل مع تغطية موسعة ومساعدة قانونية متضمنة" : (t("nav.home") === "Home" ? "All-risk insurance with extended coverage and legal assistance included" : "Assurance tout risque avec couverture étendue et assistance juridique incluse"),
      color: "emerald" as const,
      stats: "0 DH",
      statLabel: isRTL ? "إعفاء على سياراتنا الممتازة" : (t("nav.home") === "Home" ? "Deductible on our premium vehicles" : "Franchise sur nos véhicules premium"),
      highlights: [
        isRTL ? "تأمين شامل" : (t("nav.home") === "Home" ? "All-risk insurance" : "Assurance tous risques"),
        isRTL ? "حماية قانونية" : (t("nav.home") === "Home" ? "Legal protection" : "Protection juridique"),
        isRTL ? "مساعدة 24/7" : (t("nav.home") === "Home" ? "24/7 Assistance" : "Assistance 24/7"),
      ],
      category: "security"
    },
    {
      icon: Headphones,
      title: isRTL ? "كونسيرج VIP" : (t("nav.home") === "Home" ? "VIP Concierge" : "Conciergerie VIP"),
      description: isRTL ? "خدمة عملاء مخصصة مع مستشار شخصي ومساعدة متعددة اللغات" : (t("nav.home") === "Home" ? "Dedicated customer service with a personal advisor and multilingual assistance" : "Service client dédié avec conseiller personnel et assistance multilingue"),
      color: "violet" as const,
      stats: "24/7",
      statLabel: isRTL ? "دعم ممتاز ذو أولوية" : (t("nav.home") === "Home" ? "Priority premium support" : "Support premium prioritaire"),
      highlights: [
        isRTL ? "مستشار مخصص" : (t("nav.home") === "Home" ? "Dedicated advisor" : "Conseiller dédié"),
        isRTL ? "متعدد اللغات" : (t("nav.home") === "Home" ? "Multilingual" : "Multilingue"),
        isRTL ? "رد في أقل من 5 دقائق" : (t("nav.home") === "Home" ? "Reply < 5min" : "Réponse < 5min"),
      ],
      category: "service"
    },
    {
      icon: Award,
      title: isRTL ? "تميز معتمد" : (t("nav.home") === "Home" ? "Certified Excellence" : "Excellence Certifiée"),
      description: isRTL ? "سيارات مفحوصة وفق 150 نقطة مراقبة وشهادة AVENIR KAMIL CAR Premium" : (t("nav.home") === "Home" ? "Vehicles inspected according to 150 control points and AVENIR KAMIL CAR Premium certification" : "Véhicules inspectés selon 150 points de contrôle et certification AVENIR KAMIL CAR Premium"),
      color: "amber" as const,
      stats: "150+",
      statLabel: isRTL ? "نقاط مراقبة الجودة" : (t("nav.home") === "Home" ? "Quality control points" : "Points de contrôle qualité"),
      highlights: [
        isRTL ? "شهادة ممتازة" : (t("nav.home") === "Home" ? "Premium certification" : "Certification premium"),
        isRTL ? "فحص تقني" : (t("nav.home") === "Home" ? "Technical visit" : "Contrôle technique"),
        isRTL ? "تاريخ كامل" : (t("nav.home") === "Home" ? "Full history" : "Historique complet"),
      ],
      category: "service"
    },
    {
      icon: Zap,
      title: isRTL ? "لوجستيات متقدمة" : (t("nav.home") === "Home" ? "Advanced Logistics" : "Logistique Avancée"),
      description: isRTL ? "توصيل سريع مع تتبع GPS وخدمة كونسيرج للسيارة" : (t("nav.home") === "Home" ? "Express delivery with GPS tracking and vehicle concierge service" : "Livraison express avec suivi GPS et service de conciergerie véhicule"),
      color: "pink" as const,
      stats: "30min",
      statLabel: isRTL ? "متوسط التوصيل في المدينة" : (t("nav.home") === "Home" ? "Average city delivery" : "Livraison moyenne en ville"),
      highlights: [
        isRTL ? "تتبع GPS" : (t("nav.home") === "Home" ? "GPS Tracking" : "Tracking GPS"),
        isRTL ? "تحضير VIP" : (t("nav.home") === "Home" ? "VIP Preparation" : "Préparation VIP"),
        isRTL ? "عودة مرنة" : (t("nav.home") === "Home" ? "Flexible return" : "Retour flexible"),
      ],
      category: "logistics"
    },
    {
      icon: Globe,
      title: isRTL ? "شبكة النخبة" : (t("nav.home") === "Home" ? "Elite Network" : "Réseau Élite"),
      description: isRTL ? "تواجد دولي مع وكالات شريكة وخدمة بدون حدود" : (t("nav.home") === "Home" ? "International presence with partner agencies and borderless service" : "Présence internationale avec agences partenaires et service sans frontières"),
      color: "cyan" as const,
      stats: "50+",
      statLabel: isRTL ? "مدن شريكة ممتازة" : (t("nav.home") === "Home" ? "Premium partner cities" : "Villes partenaires premium"),
      highlights: [
        isRTL ? "دولي" : (t("nav.home") === "Home" ? "International" : "International"),
        isRTL ? "وكالات شريكة" : (t("nav.home") === "Home" ? "Partner agencies" : "Agences partenaires"),
        isRTL ? "خدمة موحدة" : (t("nav.home") === "Home" ? "Unified service" : "Service unifié"),
      ],
      category: "logistics"
    },
  ], [isRTL, t]);

  const features = useMemo(() => {
    if (dbServices.length > 0) {
      return dbServices.map(s => ({
        ...s,
        icon: Zap,
        highlights: s.highlights || []
      }));
    }
    return defaultFeatures;
  }, [dbServices, defaultFeatures]);

  const categories = [
    { id: "all", label: isRTL ? "كل الخدمات" : (t("nav.home") === "Home" ? "All Services" : "Tous les services") },
    { id: "tech", label: isRTL ? "تكنولوجيا" : "Technologie" },
    { id: "security", label: isRTL ? "أمن" : "Sécurité" },
    { id: "service", label: isRTL ? "خدمة العملاء" : "Service Client" },
    { id: "logistics", label: isRTL ? "لوجستيات" : "Logistique" },
  ];

  const filteredFeatures = features.filter((feature: any) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "tech")
      return feature.title.includes("IA") || feature.title.includes("Data") || feature.title.includes("تكنولوجيا") || feature.title.includes("AI") || feature.category === "tech";
    if (activeFilter === "security")
      return (
        feature.title.includes("Sécurité") ||
        feature.title.includes("Protection") ||
        feature.title.includes("أمن") ||
        feature.title.includes("Security") ||
        feature.category === "security"
      );
    if (activeFilter === "service")
      return (
        feature.title.includes("Conciergerie") ||
        feature.title.includes("Support") ||
        feature.title.includes("خدمة") ||
        feature.title.includes("Concierge") ||
        feature.category === "service"
      );
    if (activeFilter === "logistics")
      return (
        feature.title.includes("Livraison") || feature.title.includes("Réseau") || feature.title.includes("لوجستيات") || feature.title.includes("Logistics") || feature.category === "logistics"
      );
    return true;
  });

  useEffect(() => {
    particlesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px),
                             linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {particlesRef.current.map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 dark:from-blue-500/20 dark:to-cyan-500/20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animation: `floatParticle ${
                  3 + i * 0.1
                }s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Interactive Light */}
        <div
          className="absolute rounded-full opacity-10 dark:opacity-20 blur-3xl"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            transition: "all 0.2s ease-out",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/30 dark:to-cyan-900/30 px-4 py-2 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
              {t("features.badge")}
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>

          {/* Main Title */}
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 dark:from-blue-400 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                {t("features.title").split(" ")[0]}{" "}
                <span className="text-gray-900 dark:text-white">{t("features.title").split(" ")[1]}</span>
              </span>
            </h1>

            {/* Subtitle */}
            <div className="max-w-3xl mx-auto">
              <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t("features.subtitle")}
              </p>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  10,000+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("features.stats.clients")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  99.7%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("features.stats.satisfaction")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("features.stats.support")}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category.id
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeatures.map((feature: any, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color] || colorClasses.blue;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-3xl p-8 transition-all duration-700 ${
                  hoveredCard === index
                    ? "transform -translate-y-4 scale-[1.02] shadow-2xl"
                    : "shadow-xl"
                } ${colors.shadow} hover:shadow-2xl overflow-hidden`}
              >
                {/* Animated Border */}
                <div
                  className={`absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />

                {/* Holographic Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700`}
                />

                {/* Icon Container */}
                <div className="relative mb-8">
                  <div
                    className={`relative w-20 h-20 rounded-2xl ${colors.bg} ${colors.hover} flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 overflow-hidden`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500`}
                    />
                    <div className="relative">
                      <Icon
                        className={`w-10 h-10 ${colors.icon} transition-all duration-500 group-hover:scale-125`}
                      />
                    </div>
                  </div>

                  <div
                    className={`absolute -top-2 -right-2 bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse-slow`}
                  >
                    {feature.stats}
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  <div
                    className={`text-sm font-semibold ${colors.icon} mb-6 flex items-center gap-2`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {feature.statLabel}
                  </div>
                  <div className="space-y-3">
                    {feature.highlights.map((highlight: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${colors.light} animate-pulse`}
                        />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-4xl animate-gradient shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          </div>

          <div className="relative p-12 lg:p-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 uppercase">
              {t("features.cta.title")}
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              {t("features.cta.subtitle")}
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <button className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden">
                <span className="relative flex items-center gap-3">
                  {t("features.cta.start")}
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-4 text-white/80">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-sm">{t("features.cta.trust")}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes gridMove { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-50px) translateX(-50px); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% auto; }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        .rounded-4xl { border-radius: 2.5rem; }
      `}</style>
    </section>
  );
};
