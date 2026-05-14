import { useState, useEffect } from "react";
import {
  Car,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Shield,
  Award,
  Clock,
  Users,
  CreditCard,
  Globe,
  Heart,
  ChevronRight,
  Send,
  MessageCircle,
  Calendar,
  Star,
  Sparkles,
  Zap,
  CheckCircle,
  Lock,
  Truck,
  Package,
  Headphones,
} from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";

export const Footer = () => {
  const { t, isRTL } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  const stats = [
    { value: "10,000+", label: t("features.stats.clients"), icon: Users },
    { value: "4.9/5", label: "Note moyenne", icon: Star },
    { value: "24/7", label: "Assistance", icon: Headphones },
    { value: "50+", label: t("admin.tabs.fleet"), icon: Car },
  ];

  const quickLinks = [
    { label: t("footer.quick_links.fleet"), href: "#cars", icon: Car },
    { label: t("footer.quick_links.services"), href: "#features", icon: Package },
    { label: t("footer.quick_links.reservation"), href: "#", icon: Calendar },
    { label: t("footer.quick_links.offers"), href: "#", icon: Zap },
  ];

  const services = [
    t("footer.services.long_term"),
    t("footer.services.delivery"),
    t("footer.services.chauffeur"),
    t("footer.services.event"),
    t("footer.services.shooting"),
    t("footer.services.loyalty"),
  ];

  const paymentMethods = [
    "Visa",
    "Mastercard",
    "American Express",
    "PayPal",
    "Apple Pay",
    "Google Pay",
  ];

  // SVG background encoded properly
  const svgPattern = encodeURIComponent(
    '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="#9C92AC" fill-opacity="0.05" fill-rule="evenodd"><circle cx="3" cy="3" r="3"/><circle cx="13" cy="13" r="3"/></g></svg>',
  );

  return (
    <>
      {/* Stats Banner */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-cyan-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group"
                onMouseEnter={() => setHoveredLink(`stat-${index}`)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <div className="relative inline-block mb-3 md:mb-4">
                  <div
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                      hoveredLink === `stat-${index}`
                        ? "scale-110 rotate-6"
                        : ""
                    }`}
                  >
                    <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] md:text-sm text-blue-200 font-bold uppercase tracking-widest leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer
        id="contact"
        className="relative bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,${svgPattern}")`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-900/10 to-transparent" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-reverse" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Left Column - Brand & Newsletter */}
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-red-500 rounded-lg blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white p-1 rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-500">
                      <img src="/logo.jpeg" alt="AVENIR KAMIL CAR Logo" className="h-10 w-auto object-contain rounded" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent uppercase tracking-tighter leading-none">
                      AVENIR KAMIL <span className="text-red-600">CAR</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">
                      {t("footer.excellence")} • PREMIUM ULTRA PRO
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-8 max-w-lg">
                  {t("footer.about")}
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">
                      Assurance Premium
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
                    <Award className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300">Service 5★</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">
                      Paiement Sécurisé
                    </span>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">
                    {t("footer.newsletter.title")}
                  </h3>
                </div>
                <p className="text-gray-400 mb-6">
                  {t("footer.newsletter.desc")}
                </p>

                {isSubscribed ? (
                  <div className="text-center py-4 rounded-xl bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20">
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-green-300 font-semibold">
                      {t("footer.newsletter.success")}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("footer.newsletter.placeholder")}
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 flex items-center justify-center gap-3 group"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>{t("footer.newsletter.btn")}</span>
                    </button>
                  </form>
                )}

                <div className="text-xs text-gray-500 mt-4">
                  {t("footer.newsletter.policy")}
                </div>
              </div>
            </div>

            {/* Right Column - Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
              {/* Quick Links */}
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-base md:text-lg font-black pb-4 border-b border-gray-800 flex items-center gap-3 uppercase tracking-widest text-blue-400">
                  <ChevronRight size={18} />
                  {t("footer.quick_links.title")}
                </h3>
                <ul className="space-y-4 md:space-y-5">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() =>
                          scrollToSection(link.href.replace("#", ""))
                        }
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 group text-sm md:text-base font-bold uppercase tracking-wide"
                        onMouseEnter={() => setHoveredLink(`nav-${index}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            hoveredLink === `nav-${index}`
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-gray-800/50 text-gray-500"
                          }`}
                        >
                          <link.icon className="w-4 h-4" />
                        </div>
                        <span>{link.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-base md:text-lg font-black pb-4 border-b border-gray-800 flex items-center gap-3 uppercase tracking-widest text-purple-400">
                  <Package size={18} />
                  {t("footer.services.title")}
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 group-hover:scale-150 transition-all" />
                      <span className="text-gray-400 hover:text-white transition-colors text-sm md:text-base font-medium">
                        {service}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-base md:text-lg font-black pb-4 border-b border-gray-800 flex items-center gap-3 uppercase tracking-widest text-cyan-400">
                  <MessageCircle size={18} />
                  Contact
                </h3>
                <ul className="space-y-5 md:space-y-6">
                  <li className="flex items-start gap-4 group cursor-pointer">
                    <div className="p-3 rounded-xl bg-blue-900/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t("footer.address")}</div>
                      <div className="text-white font-bold text-sm md:text-base tracking-tight leading-tight">22, Boulevard de la Résistance, Casablanca, Maroc</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group cursor-pointer">
                    <div className="p-3 rounded-xl bg-purple-900/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-lg">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t("footer.phone")}</div>
                      <div className="text-white font-bold text-sm md:text-base tracking-tight leading-tight">+212 600 000 000</div>
                      <div className="text-gray-500 text-[10px] font-bold uppercase mt-1">24/7 Premium</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              {/* Social Media */}
              <div className="flex items-center gap-6">
                <span className="text-gray-400">{t("footer.follow_us")}</span>
                <div className="flex gap-3">
                  {[
                    {
                      icon: Facebook,
                      color: "text-blue-400",
                      hover: "hover:bg-blue-500/20",
                      label: "Facebook",
                    },
                    {
                      icon: Twitter,
                      color: "text-cyan-400",
                      hover: "hover:bg-cyan-500/20",
                      label: "Twitter",
                    },
                    {
                      icon: Instagram,
                      color: "text-pink-400",
                      hover: "hover:bg-pink-500/20",
                      label: "Instagram",
                    },
                    {
                      icon: Linkedin,
                      color: "text-blue-500",
                      hover: "hover:bg-blue-600/20",
                      label: "LinkedIn",
                    },
                    {
                      icon: Globe,
                      color: "text-green-400",
                      hover: "hover:bg-green-500/20",
                      label: "Website",
                    },
                  ].map((social, index) => (
                    <button
                      key={index}
                      className={`p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 ${social.hover} ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400">{t("footer.payments")}</span>
                <div className="flex flex-wrap gap-3">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {/* Copyright */}
              <div className="text-center lg:text-right">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{t("footer.made_with")}</span>
                </div>
                <div className="text-gray-500 text-sm">
                  © 2026 AVENIR KAMIL CAR. {t("footer.rights")}
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-800/50">
              {[
                "Conditions Générales",
                "Politique de Confidentialité",
                "Mentions Légales",
                "CGV",
                "Cookies",
                "Accessibilité",
              ].map((link, index) => (
                <button
                  key={index}
                  className="text-sm text-gray-500 hover:text-white transition-colors duration-300"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-110 group"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </button>
        )}

        {/* Chat Support Button */}
        <button className="fixed bottom-8 left-8 z-50 p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-110 group flex items-center gap-3">
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-semibold">Support 24/7</span>
        </button>

        {/* Custom CSS */}
        <style>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(20px, -20px) rotate(5deg); }
            66% { transform: translate(-10px, 10px) rotate(-5deg); }
          }
          
          @keyframes float-reverse {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-20px, 20px) rotate(-5deg); }
            66% { transform: translate(10px, -10px) rotate(5deg); }
          }
          
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s ease infinite;
          }
          
          .animate-float-slow {
            animation: float-slow 20s ease-in-out infinite;
          }
          
          .animate-float-reverse {
            animation: float-reverse 25s ease-in-out infinite;
          }
        `}</style>
      </footer>
    </>
  );
};
