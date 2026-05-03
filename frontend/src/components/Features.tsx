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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const features = [
  {
    icon: Clock,
    title: "Réservation Immédiate",
    description:
      "Système de réservation intelligent avec confirmation instantanée et gestion temps réel",
    color: "blue",
    stats: "98%",
    statLabel: "Réservations validées en < 2min",
    highlights: [
      "Disponibilité temps réel",
      "Paiement sécurisé",
      "Confirmation SMS",
    ],
  },
  {
    icon: Shield,
    title: "Protection Ultime",
    description:
      "Assurance tout risque avec couverture étendue et assistance juridique incluse",
    color: "emerald",
    stats: "0 DH",
    statLabel: "Franchise sur nos véhicules premium",
    highlights: [
      "Assurance tous risques",
      "Protection juridique",
      "Assistance 24/7",
    ],
  },
  {
    icon: Headphones,
    title: "Conciergerie VIP",
    description:
      "Service client dédié avec conseiller personnel et assistance multilingue",
    color: "violet",
    stats: "24/7",
    statLabel: "Support premium prioritaire",
    highlights: ["Conseiller dédié", "Multilingue", "Réponse < 5min"],
  },
  {
    icon: Award,
    title: "Excellence Certifiée",
    description:
      "Véhicules inspectés selon 150 points de contrôle et certification LuxeDrive Premium",
    color: "amber",
    stats: "150+",
    statLabel: "Points de contrôle qualité",
    highlights: [
      "Certification premium",
      "Contrôle technique",
      "Historique complet",
    ],
  },
  {
    icon: Zap,
    title: "Logistique Avancée",
    description:
      "Livraison express avec suivi GPS et service de conciergerie véhicule",
    color: "pink",
    stats: "30min",
    statLabel: "Livraison moyenne en ville",
    highlights: ["Tracking GPS", "Préparation VIP", "Retour flexible"],
  },
  {
    icon: Globe,
    title: "Réseau Élite",
    description:
      "Présence internationale avec agences partenaires et service sans frontières",
    color: "cyan",
    stats: "50+",
    statLabel: "Villes partenaires premium",
    highlights: ["International", "Agences partenaires", "Service unifié"],
  },
  {
    icon: Cpu,
    title: "Technologie IA",
    description:
      "Système de recommandation intelligent et gestion prédictive de la flotte",
    color: "indigo",
    stats: "AI",
    statLabel: "Recommandation personnalisée",
    highlights: [
      "Algorithme IA",
      "Prédiction maintenance",
      "Optimisation flotte",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Sécurité Maximale",
    description:
      "Système de sécurité avancé avec géolocalisation et protection anti-intrusion",
    color: "rose",
    stats: "100%",
    statLabel: "Véhicules équipés sécurité",
    highlights: ["Géolocalisation", "Protection anti-vol", "Sécurité active"],
  },
  {
    icon: TrendingUp,
    title: "Performance Data",
    description:
      "Analyse de conduite et optimisation des performances grâce aux datas",
    color: "lime",
    stats: "∞",
    statLabel: "Données analysées en temps réel",
    highlights: [
      "Analytics temps réel",
      "Rapports personnalisés",
      "Optimisation",
    ],
  },
];

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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const particlesRef = useRef<
    Array<{ x: number; y: number; size: number; speed: number }>
  >([]);

  const categories = [
    { id: "all", label: isRTL ? "كل الخدمات" : (t("features.title") === "Premium Services" ? "All Services" : "Tous les services") },
    { id: "tech", label: isRTL ? "تكنولوجيا" : "Technologie" },
    { id: "security", label: isRTL ? "أمن" : "Sécurité" },
    { id: "service", label: isRTL ? "خدمة العملاء" : "Service Client" },
    { id: "logistics", label: isRTL ? "لوجستيات" : "Logistique" },
  ];

  const filteredFeatures = features.filter((feature) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "tech")
      return feature.title.includes("IA") || feature.title.includes("Data");
    if (activeFilter === "security")
      return (
        feature.title.includes("Sécurité") ||
        feature.title.includes("Protection")
      );
    if (activeFilter === "service")
      return (
        feature.title.includes("Conciergerie") ||
        feature.title.includes("Support")
      );
    if (activeFilter === "logistics")
      return (
        feature.title.includes("Livraison") || feature.title.includes("Réseau")
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
              {isRTL ? "تميز معتمد" : (t("features.title") === "Premium Services" ? "Certified Excellence" : "Excellence Certifiée")}
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
                  Clients Satisfaits
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  99.7%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Taux de Satisfaction
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Support Premium
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
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];

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
                    {/* Icon Glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500`}
                    />

                    {/* Animated Icon */}
                    <div className="relative">
                      <Icon
                        className={`w-10 h-10 ${colors.icon} transition-all duration-500 group-hover:scale-125`}
                      />

                      {/* Orbital Particles */}
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute w-2 h-2 rounded-full ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                          style={{
                            animation: `orbitIcon ${
                              2 + i * 0.5
                            }s linear infinite`,
                            animationDelay: `${i * 0.2}s`,
                            transform: `rotate(${
                              i * 90
                            }deg) translateX(30px) rotate(-${i * 90}deg)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats Badge */}
                  <div
                    className={`absolute -top-2 -right-2 bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse-slow`}
                  >
                    {feature.stats}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-500">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {feature.description}
                  </p>

                  {/* Stats Label */}
                  <div
                    className={`text-sm font-semibold ${colors.icon} mb-6 flex items-center gap-2`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {feature.statLabel}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3">
                    {feature.highlights.map((highlight, i) => (
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

                  {/* CTA Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <div
                      className={`w-12 h-12 rounded-full ${colors.light} flex items-center justify-center`}
                    >
                      <Zap className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-4xl animate-gradient shadow-2xl overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />

            {/* Floating Elements */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-white/30 rounded-full animate-float"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="relative p-12 lg:p-16 text-center">
            {/* Title */}
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              ÉLÉVEZ VOTRE EXPÉRIENCE AU NIVEAU SUPÉRIEUR
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Rejoignez l'élite des conducteurs et bénéficiez d'un service sans
              compromis
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">4.9★</div>
                <div className="text-white/80 text-sm">Note moyenne</div>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">24h</div>
                <div className="text-white/80 text-sm">Support réponse</div>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-white/80 text-sm">
                  Satisfaction garantie
                </div>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-white/80 text-sm">Possibilités</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-6 justify-center">
              <button className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-3">
                  Démarrer l'Expérience
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>

              <button className="group bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-3">
                  Découvrir les Avantages
                  <Award className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </span>
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 flex items-center justify-center gap-4 text-white/80">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-sm">
                Garantie satisfaction 30 jours • Paiement 100% sécurisé •
                Support prioritaire
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(10px); }
        }
        
        @keyframes orbitIcon {
          from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
        }
        
        @keyframes gridMove {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-50px) translateX(-50px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .rounded-4xl {
          border-radius: 2.5rem;
        }
      `}</style>
    </section>
  );
};
