import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Fuel,
  Users,
  Gauge,
  Calendar,
  Shield,
  Zap,
  Settings,
  Car,
  MapPin,
  CreditCard,
  CheckCircle,
  X,
  Battery,
  Cpu,
  Wind,
  Droplets,
  Wifi,
  Volume2,
  Sparkles,
  Thermometer,
  GitCompare,
  BarChart,
  Clock,
  Package,
  Key,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  AlertCircle,
  Play,
  BookOpen,
  FileText,
  Globe,
  Navigation,
  Radio,
  AirVent,
  Sun,
  Snowflake,
  Droplet,
  Power,
  BatteryCharging,
  ZapOff,
  Percent,
  Award,
  Truck,
  Home,
  UserCheck,
  ClipboardCheck,
  Smartphone,
  CreditCard as Card,
  Euro,
  Tag,
  Clock as ClockIcon,
  TrendingUp,
  Award as Trophy,
  Shield as ShieldIcon,
  Cpu as CpuIcon,
  Wrench,
  Coins,
  Eye as EyeIcon,
  Menu,
  ChevronDown,
} from "lucide-react";
import { Header } from "./Header";
import { getCars, bookingService } from "../services/api";

interface CarDetailsProps {
  carId?: string | null;
  onBack?: () => void;
}

export const CarDetails: React.FC<CarDetailsProps> = ({
  carId: propCarId,
  onBack,
}) => {
  const navigate = useNavigate();
  const { id: urlCarId } = useParams<{ id: string }>();
  const id = propCarId || urlCarId;

  const [car, setCar] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [bookingDates, setBookingDates] = useState({ start: "", end: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(
    "Casablanca - Ain Diab",
  );
  const [insuranceOption, setInsuranceOption] = useState("premium");
  const [daysCount, setDaysCount] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileTabs, setShowMobileTabs] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowMobileTabs(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchCar() {
      setIsLoading(true);
      try {
        const cars = await getCars();
        const foundCar = cars.find((c: any) => c._id === id);
        if (foundCar) {
          // Add default values for fields that might be missing in the real DB
          const enrichedCar = {
            ...foundCar,
            name: `${foundCar.brand} ${foundCar.model}`,
            images:
              foundCar.images && foundCar.images.length > 0
                ? foundCar.images
                : [foundCar.image],
            dailyPrice: foundCar.pricePerDay.toString(),
            weeklyPrice: (foundCar.pricePerDay * 6).toString(),
            monthlyPrice: (foundCar.pricePerDay * 22).toString(),
            specs: {
              fuel: foundCar.fuel || "Hybride",
              seats: foundCar.seats || "5",
              speed: foundCar.speed || "250 km/h",
              acceleration: foundCar.acceleration || "4.5s",
              range: foundCar.range || "N/A",
              power: foundCar.power || "400 ch",
              consumption: foundCar.consumption || "6L/100km",
            },
            rating: foundCar.rating || 4.8,
            reviews: foundCar.reviews || 120,
            description:
              foundCar.description ||
              "Une expérience de conduite exceptionnelle alliant luxe et performance.",
            included: [
              "Assurance tous risques Premium",
              "Kilométrage illimité",
              "Entretien et maintenance inclus",
              "Assistance 24/7",
            ],
            equipment: [
              { name: "Système audio Premium", included: true },
              { name: "Toit panoramique", included: true },
              { name: "Sièges chauffants", included: true },
              { name: "Caméras 360°", included: true },
            ],
            reviewsList: [
              {
                name: "Amine K.",
                rating: 5,
                comment: "Excellente voiture, service impeccable.",
                date: "2024-03-15",
              },
              {
                name: "Sarah L.",
                rating: 5,
                comment: "Très satisfaite de la location.",
                date: "2024-03-10",
              },
            ],
            popularity: 95,
            reservations: 42,
            availability: "Disponible",
          };
          setCar(enrichedCar);

          // Animation trigger
          setTimeout(() => {
            if (imageRef.current) {
              imageRef.current.style.opacity = "1";
              imageRef.current.style.transform = "translateX(0)";
            }
            if (detailsRef.current) {
              detailsRef.current.style.opacity = "1";
              detailsRef.current.style.transform = "translateX(0)";
            }
          }, 100);
        }
      } catch (err) {
        console.error("Error fetching car details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCar();
  }, [id]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/cars");
    }
  };

  const handleBook = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    setShowBookingModal(true);
    setBookingStep(1);
  };

  const calculateTotal = () => {
    if (bookingDates.start && bookingDates.end) {
      const start = new Date(bookingDates.start);
      const end = new Date(bookingDates.end);
      const diffDays =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
      return diffDays * parseInt(car.pricePerDay);
    }
    return daysCount * parseInt(car.pricePerDay);
  };

  const calculateInsurance = () => {
    const base = calculateTotal();
    switch (insuranceOption) {
      case "basic":
        return base * 0.1;
      case "premium":
        return base * 0.15;
      case "ultimate":
        return base * 0.2;
      default:
        return 0;
    }
  };

  const handleNextStep = async () => {
    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
    } else {
      try {
        const bookingData = {
          carId: car._id,
          startDate: bookingDates.start,
          endDate: bookingDates.end,
          totalAmount:
            calculateTotal() +
            calculateInsurance() +
            (selectedLocation.includes("domicile") ? 50 : 0),
          options: {
            insurance: insuranceOption,
            location: selectedLocation,
          },
        };
        await bookingService.create(bookingData);
        alert(
          "Réservation confirmée ! Vous pouvez voir votre reçu dans votre tableau de bord.",
        );
        setShowBookingModal(false);
        navigate("/client");
      } catch (error: any) {
        alert("Erreur lors de la réservation: " + error.message);
      }
    }
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : car.images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < car.images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (car?.images?.length && selectedImage >= car.images.length) {
      setSelectedImage(0);
    }
  }, [car?.images, selectedImage]);

  const getEmbedVideoUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const tabs = [
    { id: "overview", label: "Aperçu", icon: <EyeIcon className="w-4 h-4" /> },
    {
      id: "specs",
      label: "Spécifications",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: "features",
      label: "Équipements",
      icon: <Package className="w-4 h-4" />,
    },
    { id: "pricing", label: "Tarifs", icon: <Euro className="w-4 h-4" /> },
    { id: "reviews", label: "Avis", icon: <Star className="w-4 h-4" /> },
    {
      id: "location",
      label: "Localisation",
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const quickSpecs = [
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Puissance",
      value: car?.specs?.power || "N/A",
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "0-100 km/h",
      value: car?.specs?.acceleration || "N/A",
    },
    {
      icon: <BatteryCharging className="w-4 h-4" />,
      label: "Autonomie",
      value: car?.specs?.range || "N/A",
    },
    {
      icon: <Fuel className="w-4 h-4" />,
      label: "Énergie",
      value: car?.specs?.fuel || "N/A",
    },
    {
      icon: <Thermometer className="w-4 h-4" />,
      label: "Consommation",
      value: car?.specs?.consumption || "N/A",
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Places",
      value: car?.specs?.seats || "N/A",
    },
  ];

  const overviewStats = [
    {
      icon: <ClockIcon className="w-5 h-5" />,
      label: "Disponibilité",
      value: car?.availability || "N/A",
      color: "text-green-500",
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: "Livraison",
      value: "Gratuite",
      color: "text-blue-500",
    },
    {
      icon: <ShieldIcon className="w-5 h-5" />,
      label: "Assurance",
      value: "Premium",
      color: "text-purple-500",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Popularité",
      value: `${car?.popularity || 0}%`,
      color: "text-yellow-500",
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: "Réservations",
      value: car?.reservations || 0,
      color: "text-cyan-500",
    },
    {
      icon: <CpuIcon className="w-5 h-5" />,
      label: "État",
      value: "Neuf",
      color: "text-emerald-500",
    },
  ];

  const insuranceOptions = [
    {
      name: "Assurance Basic",
      price: "10% du total",
      description: "Couverture minimale",
      value: "basic",
    },
    {
      name: "Assurance Premium",
      price: "15% du total",
      description: "Couverture complète",
      value: "premium",
    },
    {
      name: "Assurance Ultimate",
      price: "20% du total",
      description: "Tous risques + franchise 0 DH",
      value: "ultimate",
    },
  ];

  const locations = [
    "Casablanca - Ain Diab",
    "Rabat - Agdal",
    "Marrakech - Hivernage",
    "Agadir - Plage",
    "Livraison à domicile (+50 DH)",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center px-4">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin-slow" />
            <div className="absolute inset-8 border-4 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full animate-spin-reverse-slow" />
            <Car className="w-16 h-16 absolute inset-0 m-auto text-blue-500 animate-pulse" />
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
            Chargement des détails...
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Car className="w-24 h-24 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 text-center">
          Véhicule non trouvé
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Désolé, le véhicule que vous recherchez n'est pas disponible.
        </p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-xl hover:shadow-2xl text-sm"
        >
          Retour à la flotte
        </button>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Back Button - Mobile Optimized */}
        <button
          onClick={handleBack}
          className="fixed top-24 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-lg font-semibold text-gray-800 dark:text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-700 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour</span>
        </button>

        {/* Action Buttons - Mobile Optimized */}
        <div className="fixed top-24 right-4 z-50 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
              isFavorite
                ? "bg-red-500/20 border-red-500/30 text-red-500"
                : "bg-white/80 dark:bg-gray-800/80 border-gray-300/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
            } border shadow-lg`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} />
          </button>
          <button className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-300/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 shadow-lg hover:scale-110 transition-all duration-300">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-24 right-16 z-50 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-300/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 shadow-lg lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Tabs Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden">
            <div className="absolute top-36 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 min-w-[200px] border border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-16">
          {/* Breadcrumb - Mobile Optimized */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {["Accueil", "Flotte", car.name].map((item, index) => (
              <div key={item} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={index < 2 ? handleBack : undefined}
                  className={`transition-colors text-xs ${
                    index === 2
                      ? "text-gray-900 dark:text-white font-semibold truncate max-w-[120px]"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {item}
                </button>
                {index < 2 && (
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid - Mobile First */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Images & Visual */}
            <div
              ref={imageRef}
              className="space-y-4 lg:space-y-6 opacity-0 transform -translate-x-10 transition-all duration-1000"
            >
              {/* Main Image with Effects */}
              <div className="relative rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/30 shadow-2xl group">
                <img
                  src={car.images[selectedImage]}
                  alt={car.name}
                  className="w-full h-[240px] sm:h-[320px] md:h-[400px] lg:h-[500px] object-cover transition-transform duration-1000"
                  onClick={() => setShowImageModal(true)}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Navigation Arrows - Mobile Touch Friendly */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-lg text-white hover:bg-black/80 transition-all opacity-70 group-hover:opacity-100 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-lg text-white hover:bg-black/80 transition-all opacity-70 group-hover:opacity-100 active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Image Navigation */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {car.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        selectedImage === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <div className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-lg text-white text-xs font-semibold">
                    {car.category}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-lg">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-xs">
                      {car.rating}
                    </span>
                    <span className="text-white/70 text-xs">
                      ({car.reviews})
                    </span>
                  </div>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(true);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-lg text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {car.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative overflow-hidden rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                      selectedImage === index
                        ? "border-blue-500 ring-1 ring-blue-500/30"
                        : "border-gray-300/50 dark:border-gray-700/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-16 sm:h-20 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              {car.videoUrl && (
                <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black shadow-lg">
                  {car.videoUrl.includes("youtube.com") ||
                  car.videoUrl.includes("youtu.be") ? (
                    <iframe
                      title="Vidéo du véhicule"
                      src={getEmbedVideoUrl(car.videoUrl)}
                      className="w-full h-72"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      className="w-full h-72 object-cover"
                      poster={car.images[0]}
                    >
                      <source src={car.videoUrl} type="video/mp4" />
                      Votre navigateur ne supporte pas la vidéo.
                    </video>
                  )}
                </div>
              )}

              {/* Quick Specs Card */}
              <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/30 shadow-lg">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-blue-500" />
                  Spécifications clés
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {quickSpecs.map((spec, index) => (
                    <div
                      key={index}
                      className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:scale-105 transition-all active:scale-95"
                    >
                      <div className="flex justify-center mb-1 text-blue-600 dark:text-blue-400">
                        {spec.icon}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                        {spec.label}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Details & Booking */}
            <div
              ref={detailsRef}
              className="space-y-4 lg:space-y-6 opacity-0 transform translate-x-10 transition-all duration-1000 delay-300"
            >
              {/* Header with Title & Price */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {car.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                        {car.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-4 h-4 ${
                                i < Math.floor(car.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {car.rating}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
                          ({car.reviews} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      {car.price} DH
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      /jour
                    </div>
                    {car.discount && (
                      <div className="inline-block px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold mt-1">
                        Économisez {car.discount}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {car.description}
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleBook}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Réserver</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <div className="flex gap-2 sm:gap-2">
                    <button className="px-3 py-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Tabs Dropdown */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileTabs(!showMobileTabs)}
                  className="w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {tabs.find((t) => t.id === activeTab)?.icon}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showMobileTabs ? "rotate-180" : ""}`}
                  />
                </button>

                {showMobileTabs && (
                  <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300/50 dark:border-gray-700/50 shadow-lg">
                    {tabs
                      .filter((tab) => tab.id !== activeTab)
                      .map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setShowMobileTabs(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {tab.icon}
                          <span className="text-gray-700 dark:text-gray-300">
                            {tab.label}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Desktop Tabs Navigation */}
              <div className="hidden lg:block border-b border-gray-200 dark:border-gray-800">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px] sm:min-h-[300px]">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {overviewStats.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm"
                        >
                          <div
                            className={`flex items-center gap-2 mb-1 ${item.color}`}
                          >
                            {item.icon}
                            <div className="font-semibold text-xs sm:text-sm truncate">
                              {item.label}
                            </div>
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Ce qui est inclus
                      </h4>
                      <div className="space-y-1.5">
                        {car.included
                          .slice(0, 4)
                          .map((item: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {item}
                              </span>
                            </div>
                          ))}
                        {car.included.length > 4 && (
                          <button
                            onClick={() => setActiveTab("features")}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1 hover:underline"
                          >
                            Voir plus ({car.included.length - 4} autres)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(car.specs).map(([key, value], index) => (
                        <div
                          key={key}
                          className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm text-right truncate ml-2">
                              {value as string}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-2">
                    {car.equipment.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-3 rounded-lg ${item.included ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                      >
                        {item.included ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={`${item.included ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"} text-sm`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          period: "Par jour",
                          price: `${car.dailyPrice} DH`,
                          discount: null,
                        },
                        {
                          period: "Par semaine",
                          price: `${car.weeklyPrice} DH`,
                          discount: "-15%",
                        },
                        {
                          period: "Par mois",
                          price: `${car.monthlyPrice} DH`,
                          discount: "-30%",
                        },
                      ].map((plan, index) => (
                        <div
                          key={index}
                          className={`text-center p-4 rounded-xl border ${index === 1 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-300 dark:border-gray-700"} hover:scale-105 transition-all active:scale-95`}
                        >
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {plan.period}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {plan.price}
                          </div>
                          {plan.discount && (
                            <div className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                              {plan.discount} économisés
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            TVA incluse
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/30">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-purple-500" />
                        Simulateur de prix
                      </h4>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="number"
                            placeholder="Nombre de jours"
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
                            value={daysCount}
                            onChange={(e) =>
                              setDaysCount(parseInt(e.target.value) || 1)
                            }
                            min="1"
                          />
                          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm">
                            Total: {daysCount * parseInt(car.dailyPrice)} DH
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          * Assurance et services inclus
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-3">
                    {car.reviewsList.map((review: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {review.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/30">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        Points de retrait
                      </h4>
                      <div className="space-y-2">
                        {locations.map((location, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${index === 0 ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
                              >
                                <Car className="w-3 h-3" />
                              </div>
                              <div className="max-w-[70%]">
                                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {location}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedLocation(location)}
                              className={`px-2 py-1 rounded text-xs ${index === 0 ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                            >
                              {selectedLocation === location ? "✓" : "Choisir"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Booking Bar - Mobile Optimized */}
              <div className="sticky bottom-0 bg-gradient-to-r from-white via-white to-white/95 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-4 -mx-4 -mb-4 mt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {car.price} DH
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        /jour
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Assurance incluse
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => navigate("/cars")}
                      className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 text-sm"
                    >
                      Comparer
                    </button>
                    <button
                      onClick={handleBook}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95 group flex items-center justify-center gap-2 text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Réserver</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal - Mobile Optimized */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-0">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={car.images[selectedImage]}
              alt={car.name}
              className="max-w-full max-h-full object-contain"
              onClick={() => setShowImageModal(false)}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {car.images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  selectedImage === index
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Booking Modal - Mobile Optimized */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-3xl max-h-[90vh] overflow-y-auto">
            {/* Progress Bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${(bookingStep / 4) * 100}%` }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="p-4 sm:p-6">
              {/* Step 1: Dates */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Choisissez vos dates
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Sélectionnez la période de location
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Date de début
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={bookingDates.start}
                          onChange={(e) =>
                            setBookingDates({
                              ...bookingDates,
                              start: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Date de fin
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={bookingDates.end}
                          onChange={(e) =>
                            setBookingDates({
                              ...bookingDates,
                              end: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {bookingDates.start && bookingDates.end && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Durée totale
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {Math.ceil(
                              (new Date(bookingDates.end).getTime() -
                                new Date(bookingDates.start).getTime()) /
                                (1000 * 3600 * 24),
                            )}{" "}
                            jours
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Coût total
                          </div>
                          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {calculateTotal()} DH
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleNextStep}
                    disabled={!bookingDates.start || !bookingDates.end}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Suivant
                  </button>
                </div>
              )}

              {/* Step 2: Options */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Options additionnelles
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Personnalisez votre location
                    </p>
                  </div>

                  <div className="space-y-2">
                    {insuranceOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          insuranceOption === option.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="insurance"
                            value={option.value}
                            checked={insuranceOption === option.value}
                            onChange={(e) => setInsuranceOption(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {option.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {option.price}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-xl transition-all text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Lieu de retrait
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Choisissez où récupérer votre véhicule
                    </p>
                  </div>

                  <div className="space-y-2">
                    {locations.map((location) => (
                      <label
                        key={location}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedLocation === location
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="location"
                            value={location}
                            checked={selectedLocation === location}
                            onChange={(e) =>
                              setSelectedLocation(e.target.value)
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">
                              {location}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {location.includes("domicile") ? "+50 DH" : "Gratuit"}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-xl transition-all text-sm"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {bookingStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Récapitulatif
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Vérifiez les détails de votre réservation
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                        Détails de la réservation
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Véhicule
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate ml-2 max-w-[150px]">
                            {car.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Période
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {bookingDates.start} au {bookingDates.end}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Durée
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {Math.ceil(
                              (new Date(bookingDates.end).getTime() -
                                new Date(bookingDates.start).getTime()) /
                                (1000 * 3600 * 24),
                            )}{" "}
                            jours
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Lieu de retrait
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate ml-2 max-w-[120px]">
                            {selectedLocation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                        Détails du paiement
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Location
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {calculateTotal()} DH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Assurance
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {calculateInsurance()} DH
                          </span>
                        </div>
                        {selectedLocation.includes("domicile") && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              Livraison à domicile
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              50 DH
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              {calculateTotal() +
                                calculateInsurance() +
                                (selectedLocation.includes("domicile")
                                  ? 50
                                  : 0)}{" "}
                              DH
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingStep(3)}
                      className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-xl transition-all text-sm flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      Payer et confirmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 4s linear infinite;
        }
        
        /* Better touch interactions on mobile */
        @media (hover: none) and (pointer: coarse) {
          button, input, select, textarea {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Improved modal for mobile */
        @media (max-width: 640px) {
          #booking-modal {
            border-radius: 16px 16px 0 0 !important;
          }
        }
      `}</style>
    </>
  );
};
