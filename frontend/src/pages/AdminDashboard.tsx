import { useEffect, useState, useRef } from "react";
import {
  getUsers,
  getCars,
  carService,
  bookingService,
  expenseService,
  settingsService,
} from "../services/api";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Car as CarIcon,
  LayoutDashboard,
  Database,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Save,
  DollarSign,
  Activity,
  Image as ImageIcon,
  Zap,
  Briefcase,
  Globe,
  Award,
  Settings,
  Tool,
  CreditCard,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  AlertTriangle,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Car, Reservation, Expense } from "../types";

interface CarFormData {
  brand: string;
  model: string;
  category: string;
  pricePerDay: string;
  image: string;
  images: string[];
  videoUrl: string;
  fuel: string;
  seats: string;
  speed: string;
  available: boolean;
  status: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCarModal, setShowCarModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const [carForm, setCarForm] = useState<CarFormData>({
    brand: "",
    model: "",
    category: "Luxe",
    pricePerDay: "",
    image: "",
    images: [],
    videoUrl: "",
    fuel: "Essence",
    seats: "5",
    speed: "250 km/h",
    available: true,
    status: "available",
  });

  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; time: string }>>([]);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time notification every 45 seconds
    const interval = setInterval(() => {
      const messages = [
        "Nouvelle réservation: Range Rover Sport",
        "Paiement reçu: #FR-8829",
        "Nouveau message client: Ahmed K.",
        "Alerte Maintenance: BMW X5",
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLatestNotification(randomMsg);
      setShowToast(true);
      
      // Add to notifications list
      setNotifications(prev => [{
        id: Date.now(),
        message: randomMsg,
        time: "À l'instant"
      }, ...prev].slice(0, 5));

      setTimeout(() => setShowToast(false), 5000);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const [galleryImageUrl, setGalleryImageUrl] = useState("");

  const defaultAgencySettings = {
    name: "LuxeDrive Premium",
    email: "contact@luxedrive.ma",
    phone: "+212 600 000 000",
    address: "Boulevard d'Anfa, Casablanca",
    currency: "DH",
    taxRate: "20",
    galleryImages: [
      "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
      "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
      "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
      "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg"
    ] as string[],
    galleryVideoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  };

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "maintenance",
    date: new Date().toISOString().split("T")[0],
    carId: "",
  });

  const [agencySettings, setAgencySettings] = useState(defaultAgencySettings);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [userData, carData, bookingData, expenseData, settingsData] =
        await Promise.all([
          getUsers(),
          getCars(),
          bookingService.getAll(),
          expenseService.getAll(),
          settingsService.get(),
        ]);
      setUsers(userData);
      setCars(carData);
      setBookings(bookingData);
      setExpenses(expenseData);
      if (settingsData) {
        const mergedSettings = {
          ...defaultAgencySettings,
          ...settingsData,
        };
        
        // If the backend has empty arrays/strings, use the defaults provided by the user
        if (!mergedSettings.galleryImages || mergedSettings.galleryImages.length === 0) {
          mergedSettings.galleryImages = defaultAgencySettings.galleryImages;
        }
        if (!mergedSettings.galleryVideoUrl) {
          mergedSettings.galleryVideoUrl = defaultAgencySettings.galleryVideoUrl;
        }

        setAgencySettings(mergedSettings);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateSettings = async () => {
    setIsSubmitting(true);
    try {
      await settingsService.update(agencySettings);
      await loadData();
      alert("Réglages enregistrés !");
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGalleryImage = () => {
    if (!galleryImageUrl.trim()) return;
    setAgencySettings({
      ...agencySettings,
      galleryImages: [
        ...(agencySettings.galleryImages || []),
        galleryImageUrl.trim(),
      ],
    });
    setGalleryImageUrl("");
  };

  const removeGalleryImage = (index: number) => {
    setAgencySettings({
      ...agencySettings,
      galleryImages: (agencySettings.galleryImages || []).filter(
        (_: string, idx: number) => idx !== index,
      ),
    });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await expenseService.create({
        ...expenseForm,
        amount: Number(expenseForm.amount),
      });
      setShowExpenseModal(false);
      setExpenseForm({
        title: "",
        amount: "",
        category: "maintenance",
        date: new Date().toISOString().split("T")[0],
        carId: "",
      });
      loadData();
    } catch (err) {
      alert("Erreur lors de l'ajout du frais");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinance = () => {
    const revenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = revenue - totalExpenses;
    return { revenue, totalExpenses, netProfit };
  };

  const { revenue, totalExpenses, netProfit } = calculateFinance();

  const stats = [
    {
      label: "Chiffre d'Affaires",
      value: `${revenue} ${agencySettings.currency}`,
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Dépenses (Frais)",
      value: `${totalExpenses} ${agencySettings.currency}`,
      icon: Wallet,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Bénéfice Net",
      value: `${netProfit} ${agencySettings.currency}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Taux de Marge",
      value: `${revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0}%`,
      icon: PieChart,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carForm.images.length) {
      alert("Veuillez ajouter au moins une photo");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...carForm,
        image: carForm.images[0],
        pricePerDay: Number(carForm.pricePerDay),
        seats: Number(carForm.seats),
      };
      if (editingCarId) await carService.update(editingCarId, payload);
      else await carService.create(payload);
      setShowCarModal(false);
      resetForm();
      loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      alert(`Erreur lors de l'enregistrement: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    const fileReaders = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("File read failed"));
          }
        };
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(fileReaders);
      setCarForm({
        ...carForm,
        images: [...carForm.images, ...results],
        image: carForm.image || results[0],
      });
    } catch (err) {
      console.error("Error reading file(s)", err);
    }
  };

  const removeCarImage = (index: number) => {
    const images = carForm.images.filter((_, idx) => idx !== index);
    setCarForm({
      ...carForm,
      images,
      image: images[0] || "",
    });
  };

  const resetForm = () => {
    setCarForm({
      brand: "",
      model: "",
      category: "Luxe",
      pricePerDay: "",
      image: "",
      images: [],
      videoUrl: "",
      fuel: "Essence",
      seats: "5",
      speed: "250 km/h",
      available: true,
      status: "available",
    });
    setEditingCarId(null);
  };

  const handleEditCar = (car: Car) => {
    setEditingCarId(car._id || null);
    setCarForm({
      brand: car.brand,
      model: car.model,
      category: car.category || "Luxe",
      pricePerDay: car.pricePerDay.toString(),
      image: car.image || (car.images && car.images[0]) || "",
      images: car.images || (car.image ? [car.image] : []),
      videoUrl: car.videoUrl || "",
      fuel: car.fuel || "Essence",
      seats: car.seats.toString(),
      speed: car.speed || "250 km/h",
      available: car.available,
      status: car.status || (car.available ? "available" : "rented"),
    });
    setShowCarModal(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm("Supprimer ce véhicule ?")) {
      try {
        await carService.delete(id);
        loadData();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handlePrintInvoice = (booking: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Facture #${booking._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
            .info { margin-top: 40px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
            .info h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px; }
            .table { width: 100%; margin-top: 60px; border-collapse: collapse; }
            .table th { text-align: left; font-size: 12px; text-transform: uppercase; color: #9ca3af; padding: 15px; border-bottom: 1px solid #f0f0f0; }
            .table td { padding: 20px 15px; border-bottom: 1px solid #f0f0f0; font-weight: 600; }
            .total { margin-top: 40px; text-align: right; }
            .total h2 { color: #2563eb; font-size: 32px; font-weight: 900; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${agencySettings.name}</div>
            <div>
              <div style="font-weight: 900">FACTURE #${booking._id.slice(-6).toUpperCase()}</div>
              <div style="color: #9ca3af">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="info">
            <div>
              <h4>Émetteur</h4>
              <div style="font-weight: 700">${agencySettings.name}</div>
              <div style="font-size: 14px; color: #4b5563">${agencySettings.address}<br>${agencySettings.phone}<br>${agencySettings.email}</div>
            </div>
            <div>
              <h4>Destinataire</h4>
              <div style="font-weight: 700">${booking.user?.name || "Client"}</div>
              <div style="font-size: 14px; color: #4b5563">${booking.user?.email}</div>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Location de véhicule: ${booking.carInfo?.brand} ${booking.carInfo?.model}</td>
                <td>Du ${booking.startDate} au ${booking.endDate}</td>
                <td>${booking.totalAmount} ${agencySettings.currency}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            <h4>Total à payer</h4>
            <h2>${booking.totalAmount} ${agencySettings.currency}</h2>
          </div>
          <div class="footer">
            Merci d'avoir choisi ${agencySettings.name}. <br>
            Ceci est une facture générée automatiquement.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const chartData = [40, 70, 55, 90, 65, 85, 100]; // Mock monthly data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <Header user={user} />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] shadow-xl shadow-blue-500/20">
              <LayoutDashboard className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black dark:text-white">
                Business Suite
              </h1>
              <p className="text-gray-500 font-medium">
                Gestion Financière & Opérationnelle
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            {[
              { id: "overview", label: "Tableau", icon: LayoutDashboard },
              { id: "cars", label: "Flotte", icon: CarIcon },
              { id: "bookings", label: "Réservations", icon: Calendar },
              { id: "expenses", label: "Frais", icon: Receipt },
              { id: "users", label: "Clients", icon: Users },
              { id: "gallery", label: "Galerie", icon: ImageIcon },
              { id: "settings", label: "Réglages", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Alerts Section */}
                {cars.some((c) => c.status === "maintenance") && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" />
                    <div>
                      <p className="font-black text-amber-600 uppercase text-[10px] tracking-widest">
                        Alerte Maintenance
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                        {cars.filter((c) => c.status === "maintenance").length}{" "}
                        véhicule(s) nécessitent une attention immédiate.
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <stat.icon size={80} />
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-6`}
                      >
                        <stat.icon size={24} />
                      </div>
                      <div className="text-4xl font-black dark:text-white mb-1 truncate">
                        {stat.value}
                      </div>
                      <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Visual Analytics */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-blue-600" /> Flux de
                        Trésorerie
                      </h2>
                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            Revenus
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            Frais
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end gap-4 h-64">
                      {chartData.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 flex items-end gap-1 h-full group"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg group-hover:from-blue-500 transition-all shadow-lg"
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h * 0.3}%` }}
                            className="flex-1 bg-gradient-to-t from-red-500 to-pink-400 rounded-t-lg group-hover:from-red-400 transition-all shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fleet Pulse */}
                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center text-center">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Zap className="text-blue-600 w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black dark:text-white mb-2">
                      {Math.round(
                        (cars.filter((c) => !c.available).length /
                          cars.length) *
                          100,
                      ) || 0}
                      %
                    </h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">
                      Utilisation Flotte
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-green-500/20">
                        <p className="text-xl font-black text-green-500">
                          {
                            cars.filter(
                              (c) => c.status === "available" || c.available,
                            ).length
                          }
                        </p>
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">
                          Prêts à Louer
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-amber-500/20">
                        <p className="text-xl font-black text-amber-500">
                          {
                            cars.filter(
                              (c) =>
                                c.status === "maintenance" ||
                                c.status === "cleaning",
                            ).length
                          }
                        </p>
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">
                          Maintenance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "expenses" && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black dark:text-white">
                    Gestion des Frais
                  </h2>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-500/30 hover:scale-105 transition-all"
                  >
                    <Plus size={20} /> ENREGISTRER UN FRAIS
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                          Dépense
                        </th>
                        <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                          Catégorie
                        </th>
                        <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                          Date
                        </th>
                        <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                          Montant
                        </th>
                        <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {expenses.map((exp) => (
                        <tr
                          key={exp._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
                        >
                          <td className="px-8 py-6">
                            <div className="font-black dark:text-white">
                              {exp.title}
                            </div>
                            {exp.carId && (
                              <div className="text-[10px] text-blue-500 font-bold uppercase">
                                Véhicule ID: {exp.carId}
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                exp.category === "maintenance"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : exp.category === "insurance"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-gray-500/10 text-gray-500"
                              }`}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-500">
                            {exp.date}
                          </td>
                          <td className="px-8 py-6 font-black text-red-500 text-lg">
                            -{exp.amount} {agencySettings.currency}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() =>
                                setExpenses(
                                  expenses.filter((e) => e._id !== exp._id),
                                )
                              }
                              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                  <h2 className="text-3xl font-black dark:text-white mb-10 flex items-center gap-4">
                    <Settings className="text-blue-600" /> Paramètres de
                    l'Agence
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                          Nom de l'Agence
                        </label>
                        <input
                          value={agencySettings.name}
                          onChange={(e) =>
                            setAgencySettings({
                              ...agencySettings,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                          Email Professionnel
                        </label>
                        <input
                          value={agencySettings.email}
                          onChange={(e) =>
                            setAgencySettings({
                              ...agencySettings,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                          Devise
                        </label>
                        <select
                          value={agencySettings.currency}
                          onChange={(e) =>
                            setAgencySettings({
                              ...agencySettings,
                              currency: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold"
                        >
                          <option>DH</option>
                          <option>$</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                          TVA (%)
                        </label>
                        <input
                          type="number"
                          value={agencySettings.taxRate}
                          onChange={(e) =>
                            setAgencySettings({
                              ...agencySettings,
                              taxRate: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">
                      Les photos et la vidéo de la page d'accueil se gèrent dans
                      l'onglet <strong>Galerie</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleUpdateSettings}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Enregistrement..."
                      : "Sauvegarder les Configurations"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "gallery" && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/20 dark:border-gray-800/50">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black dark:text-white flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <ImageIcon className="text-blue-600 w-8 h-8" />
                      </div>
                      Gestion de la Galerie
                    </h2>
                    <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black uppercase tracking-widest">
                      {agencySettings.galleryImages?.length || 0} Images
                    </span>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-8">
                      <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                        <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-blue-500" />
                          Ajouter Media
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={galleryImageUrl}
                              onChange={(e) => setGalleryImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                            />
                            <button
                              type="button"
                              onClick={addGalleryImage}
                              className="w-full btn-glass-primary flex items-center justify-center gap-2"
                            >
                              <Plus size={18} />
                              Ajouter l'image
                            </button>
                          </div>

                          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                              Vidéo URL (YouTube / MP4)
                            </label>
                            <div className="relative">
                              <input
                                type="url"
                                value={agencySettings.galleryVideoUrl}
                                onChange={(e) =>
                                  setAgencySettings({
                                    ...agencySettings,
                                    galleryVideoUrl: e.target.value,
                                  })
                                }
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                              />
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic px-1">
                              Soutient les liens YouTube et les fichiers vidéo directs.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdateSettings}
                        disabled={isSubmitting}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        Sauvegarder les Changements
                      </button>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Aperçu Live (Section #gallery)
                          </h3>
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-inner border border-gray-200 dark:border-gray-800">
                          {agencySettings.galleryImages?.length > 0 ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                {(agencySettings.galleryImages || []).map(
                                  (src, index) => (
                                    <motion.div
                                      layout
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      key={index}
                                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                                    >
                                      <img
                                        src={src}
                                        alt={`Galerie ${index + 1}`}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                          type="button"
                                          onClick={() => removeGalleryImage(index)}
                                          className="p-2 rounded-lg bg-red-500 text-white shadow-xl hover:bg-red-600 hover:scale-110 transition-all"
                                          title="Supprimer"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </motion.div>
                                  ),
                                )}
                              </div>
                              
                              {agencySettings.galleryVideoUrl && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                   <div className="rounded-xl overflow-hidden aspect-video bg-black shadow-xl">
                                     {agencySettings.galleryVideoUrl.includes('youtube.com') || agencySettings.galleryVideoUrl.includes('youtu.be') ? (
                                       <iframe
                                         src={getYoutubeEmbedUrl(agencySettings.galleryVideoUrl)}
                                         className="w-full h-full"
                                         allowFullScreen
                                       />
                                     ) : (
                                       <video src={agencySettings.galleryVideoUrl} className="w-full h-full object-cover" controls />
                                     )}
                                   </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 italic">
                              <ImageIcon size={48} className="mb-4 opacity-20" />
                              <p>Aucune image dans la galerie</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2">
                          <Globe size={12} />
                          Ceci est une simulation de la section sur la page d'accueil
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Existing tabs logic continued... */}
            {activeTab === "cars" && (
              <motion.div
                key="cars"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black dark:text-white">
                    Inventaire Flotte
                  </h2>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowCarModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:scale-105 transition-all"
                  >
                    <Plus size={20} /> NOUVEAU VÉHICULE
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cars.map((car) => (
                    <div
                      key={car._id}
                      className="bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl group"
                    >
                      <div className="h-60 overflow-hidden relative">
                        <img
                          src={car.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div
                          className={`absolute top-6 right-6 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest text-white shadow-lg ${
                            car.status === "maintenance"
                              ? "bg-amber-500"
                              : car.status === "cleaning"
                                ? "bg-cyan-500"
                                : car.available
                                  ? "bg-green-500"
                                  : "bg-red-500"
                          }`}
                        >
                          {car.status?.toUpperCase() ||
                            (car.available ? "LIBRE" : "OCCUPÉ")}
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-black dark:text-white">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                              {car.category}
                            </p>
                          </div>
                          <p className="text-3xl font-black text-blue-600">
                            {car.pricePerDay} {agencySettings.currency}
                          </p>
                        </div>
                        <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handleEditCar(car)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <Edit size={18} /> Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car._id!)}
                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-3xl font-black dark:text-white mb-10">
                  Gestion des Ventes
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                            Client
                          </th>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                            Véhicule
                          </th>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                            Période
                          </th>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                            Total
                          </th>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                            Statut
                          </th>
                          <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((b) => (
                          <tr
                            key={b._id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
                          >
                            <td className="px-8 py-6">
                              <div className="font-black dark:text-white">
                                {b.user?.name || "Client"}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {b.user?.email}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-bold dark:text-gray-300">
                                {b.carInfo?.brand} {b.carInfo?.model}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm font-black dark:text-gray-400">
                                {b.startDate}
                              </div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                au {b.endDate}
                              </div>
                            </td>
                            <td className="px-8 py-6 font-black text-blue-600 text-lg">
                              {b.totalAmount} {agencySettings.currency}
                            </td>
                            <td className="px-8 py-6">
                              <span
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                  b.status === "confirmed"
                                    ? "bg-green-500/10 text-green-500"
                                    : b.status === "cancelled"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-amber-500/10 text-amber-500"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                {b.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(b._id, "confirmed")
                                      }
                                      className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-md"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(b._id, "cancelled")
                                      }
                                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md"
                                    >
                                      <XCircle size={18} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => handlePrintInvoice(b)}
                                  className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-md"
                                  title="Générer Facture"
                                >
                                  <FileText size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-6 group hover:border-blue-500/50 transition-all"
                  >
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg group-hover:scale-110 transition-transform">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black dark:text-white">
                        {u.name}
                      </h3>
                      <p className="text-gray-500 font-medium text-sm mb-3">
                        {u.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === "admin" ? "bg-purple-500/10 text-purple-600" : "bg-green-500/10 text-green-600"}`}
                        >
                          {u.role}
                        </span>
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {showToast && latestNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[1000] flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/20 min-w-[320px]"
          >
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Zap className="text-white w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Système Alert Live</p>
              <p className="text-sm font-black dark:text-white leading-tight">{latestNotification}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
              <X size={16} className="text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Car Modal */}
      <AnimatePresence>
        {showCarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCarModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[3.5rem] border border-white/10 shadow-3xl overflow-y-auto no-scrollbar max-h-[90vh]"
            >
              <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
                <h2 className="text-3xl font-black dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                  {editingCarId ? (
                    <Edit className="text-blue-600" />
                  ) : (
                    <Plus className="text-blue-600" />
                  )}
                  {editingCarId ? "Mettre à jour" : "Ajouter Véhicule"}
                </h2>
                <button
                  onClick={() => setShowCarModal(false)}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCarSubmit} className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Marque Automobile
                      </label>
                      <input
                        required
                        value={carForm.brand}
                        onChange={(e) =>
                          setCarForm({ ...carForm, brand: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                        placeholder="Ex: Mercedes-Benz"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Modèle Spécifique
                      </label>
                      <input
                        required
                        value={carForm.model}
                        onChange={(e) =>
                          setCarForm({ ...carForm, model: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                        placeholder="Ex: Classe G63"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Prix par Jour ({agencySettings.currency})
                      </label>
                      <input
                        required
                        type="number"
                        value={carForm.pricePerDay}
                        onChange={(e) =>
                          setCarForm({
                            ...carForm,
                            pricePerDay: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-black text-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Photos du véhicule
                      </label>
                      <div className="flex flex-col gap-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-14 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-500/5 transition-all group overflow-hidden"
                        >
                          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="text-blue-500 w-8 h-8" />
                          </div>
                          <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">
                            Ajouter plusieurs images
                          </p>
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />

                        {carForm.images.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {carForm.images.map((img, index) => (
                              <div
                                key={index}
                                className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800"
                              >
                                <img
                                  src={img}
                                  alt={`Preview ${index + 1}`}
                                  className="h-32 w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCarImage(index)}
                                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Vidéo du véhicule
                      </label>
                      <input
                        type="url"
                        value={carForm.videoUrl}
                        onChange={(e) =>
                          setCarForm({ ...carForm, videoUrl: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                        placeholder="URL de la vidéo (YouTube ou MP4)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 col-span-full gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Énergie
                      </label>
                      <select
                        value={carForm.fuel}
                        onChange={(e) =>
                          setCarForm({ ...carForm, fuel: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 text-xs font-bold dark:text-white transition-all"
                      >
                        <option>Essence</option>
                        <option>Hybride</option>
                        <option>Électrique</option>
                        <option>Diesel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Places
                      </label>
                      <input
                        type="number"
                        value={carForm.seats}
                        onChange={(e) =>
                          setCarForm({ ...carForm, seats: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 text-xs font-bold dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Statut Actuel
                      </label>
                      <select
                        value={carForm.status}
                        onChange={(e) =>
                          setCarForm({ ...carForm, status: e.target.value })
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 text-xs font-bold dark:text-white transition-all"
                      >
                        <option value="available">Libre</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Nettoyage</option>
                        <option value="rented">Loué</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-12 pt-10 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowCarModal(false)}
                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-3xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                  >
                    {isSubmitting
                      ? "Traitement..."
                      : editingCarId
                        ? "Mettre à jour"
                        : "Valider l'ajout"}{" "}
                    <Save size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpenseModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                  <Receipt className="text-red-500" /> Nouveau Frais
                </h2>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Libellé du Frais
                  </label>
                  <input
                    required
                    value={expenseForm.title}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, title: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white font-bold"
                    placeholder="Ex: Vidange Porsche"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                      Montant ({agencySettings.currency})
                    </label>
                    <input
                      required
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white font-black text-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                      Catégorie
                    </label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white font-bold"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="fuel">Carburant</option>
                      <option value="insurance">Assurance</option>
                      <option value="tax">Taxes</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Date du Frais
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-red-600 text-white font-black rounded-3xl shadow-xl shadow-red-500/30 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs"
                >
                  Enregistrer la Dépense
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
