import { useEffect, useState, useRef, useMemo } from "react";
import {
  getUsers,
  deleteUser,
  getCars,
  carService,
  bookingService,
  expenseService,
  settingsService,
  serviceService,
  notificationService,
  analyticsService,
} from "../services/api";
import { Header } from "../components/Header";
import AccountingSuite from "../components/AccountingSuite";
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
  ShieldCheck,
  FileBadge,
  Clock,
  ChevronRight,
  Download,
  RefreshCw,
  TrendingDown,
  LineChart as LineChartIcon,
  MessageCircle,
  Camera,
  Ban,
  Award as AwardIcon,
  History,
  Check,
  MapPin,
  CalendarDays,
  ListFilter,
  Package,
  AlertCircle,
  Activity as ActivityIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Car, Reservation, Expense, InspectionData, InventoryItem } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Cell,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useLanguage } from "../contexts/LanguageContext";
import { updateUserPremium, inventoryService } from "../services/api";

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
  insuranceExpiry: string;
  technicalVisitExpiry: string;
  vignetteExpiry: string;
  lastOilChangeKm: string;
  nextOilChangeKm: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Analytics State
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [carPerformance, setCarPerformance] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: "", quantity: 0, minQuantity: 5, category: "Maintenance", price: 0
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClientBookings, setSelectedClientBookings] = useState<any[]>([]);
  const [selectedClientName, setSelectedClientName] = useState("");

  const handleViewClientHistory = (client: User) => {
    const clientBookings = bookings.filter(b => b.userId === client._id || b.userId === client.id);
    setSelectedClientBookings(clientBookings);
    setSelectedClientName(client.name);
    setShowHistoryModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.")) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const [showCarModal, setShowCarModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const defaultAgencySettings = {
    name: "AVENIR KAMIL CAR Premium",
    email: "contact@avenirkamilcar.ma",
    phone: "+212 600 000 000",
    address: "22, Boulevard de la Résistance, Casablanca, Maroc",
    currency: "DH",
    taxRate: "20",
    logoUrl: "",
    galleryImages: [] as string[],
    galleryVideoUrl: "",
  };

  const [agencySettings, setAgencySettings] = useState(defaultAgencySettings);

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
    insuranceExpiry: "",
    technicalVisitExpiry: "",
    vignetteExpiry: "",
    lastOilChangeKm: "",
    nextOilChangeKm: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "maintenance",
    date: new Date().toISOString().split('T')[0],
    carId: "",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "Zap",
    color: "blue",
    stats: "100%",
    statLabel: "",
    category: "tech",
    highlights: ["", "", ""],
  });

  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; time: string }>
  >([]);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<string | null>(
    null,
  );
  const [galleryImageUrl, setGalleryImageUrl] = useState("");

  const { language, setLanguage, t, isRTL } = useLanguage();

  const [fleetAlerts, setFleetAlerts] = useState<Car[]>([]);

  // Planning State
  const [planningDate, setPlanningDate] = useState(new Date());
  
  // Inspection State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [currentBookingForInspection, setCurrentBookingForInspection] = useState<Reservation | null>(null);
  const [inspectionType, setInspectionType] = useState<'check-in' | 'check-out'>('check-in');
  const [inspectionForm, setInspectionForm] = useState<{ photos: string[], notes: string }>({ photos: [], notes: "" });

  const alerts = useMemo(() => {
    const today = new Date();
    const expiryAlerts: any[] = [];
    
    cars.forEach(car => {
      if (car.insuranceExpiry) {
        const diff = (new Date(car.insuranceExpiry).getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (diff < 15) expiryAlerts.push({ type: "assurance", car: `${car.brand} ${car.model}`, date: car.insuranceExpiry, severity: diff < 5 ? "high" : "medium" });
      }
      if (car.vignetteExpiry) {
        const diff = (new Date(car.vignetteExpiry).getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (diff < 15) expiryAlerts.push({ type: "vignette", car: `${car.brand} ${car.model}`, date: car.vignetteExpiry, severity: diff < 5 ? "high" : "medium" });
      }
    });
    
    return expiryAlerts;
  }, [cars]);

  async function fetchNotifications() {
    try {
      const data = await notificationService.getAdmin();
      if (data && data.length > 0) {
        setNotifications(data);
        const latest = data[0];
        if (!latest.read) {
          setLatestNotification(latest.message);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }

  useEffect(() => {
    loadData();
    loadAlerts();
    const notificationInterval = setInterval(fetchNotifications, 60000);
    fetchNotifications();
    return () => clearInterval(notificationInterval);
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [
        userData, 
        carData, 
        bookingData, 
        expenseData, 
        settingsData, 
        serviceData,
        summary,
        monthly,
        performance,
        breakdown
      ] = await Promise.all([
          getUsers(),
          getCars(),
          bookingService.getAll(),
          expenseService.getAll(),
          settingsService.get(),
          serviceService.getAll(),
          analyticsService.getSummary(),
          analyticsService.getMonthly(),
          analyticsService.getCarPerformance(),
          analyticsService.getExpenseBreakdown()
        ]);
      setUsers(userData);
      setCars(carData);
      setBookings(bookingData);
      setExpenses(expenseData);
      setServices(serviceData || []);
      setFinancialSummary(summary.summary);
      setMonthlyStats(monthly);
      setCarPerformance(performance);
      setExpenseBreakdown(breakdown);

      if (settingsData) {
        setAgencySettings({ ...defaultAgencySettings, ...settingsData });
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingServiceId) await serviceService.update(editingServiceId, serviceForm);
      else await serviceService.create(serviceForm);
      setShowServiceModal(false);
      loadData();
    } catch (err) {
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm(t("common.delete") + "?")) return;
    try {
      await serviceService.delete(id);
      loadData();
    } catch (err) {
      alert(t("common.error"));
    }
  };

  const handleEditService = (service: any) => {
    setEditingServiceId(service._id);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon || "Zap",
      color: service.color || "blue",
      stats: service.stats || "100%",
      statLabel: service.statLabel || "",
      category: service.category || "tech",
      highlights: service.highlights || ["", "", ""],
    });
    setShowServiceModal(true);
  };

  async function loadAlerts() {
    try {
      const alerts = await carService.getAlerts();
      setFleetAlerts(alerts);
    } catch (err) {
      console.error("Error loading alerts:", err);
    }
  }

  const handleUpdateCarStatus = async (id: string, status: string, available: boolean) => {
    try {
      await carService.updateStatus(id, status, available);
      loadData();
      loadAlerts();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleUpdateSettings = async (updatedData?: any) => {
    setIsSubmitting(true);
    try {
      const dataToSave = updatedData || agencySettings;
      await settingsService.update(dataToSave);
      // alert(t("common.save")); // Remove alert for auto-save if desired, or keep it.
      // Let's keep it for manual save, but maybe skip for auto-save.
      if (!updatedData) alert(t("common.save"));
      loadData();
    } catch (err: any) {
      console.error("Settings update error:", err);
      alert(t("common.error") + (err.message ? ": " + err.message : ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const newSettings = { ...agencySettings, logoUrl: reader.result as string };
      setAgencySettings(newSettings);
      await handleUpdateSettings(newSettings);
    };
    reader.readAsDataURL(file);
  };

  const addGalleryImage = async () => {
    if (!galleryImageUrl) return;
    const newSettings = {
      ...agencySettings,
      galleryImages: [...(agencySettings.galleryImages || []), galleryImageUrl]
    };
    setAgencySettings(newSettings);
    setGalleryImageUrl("");
    await handleUpdateSettings(newSettings);
  };

  const removeGalleryImage = async (index: number) => {
    const updated = (agencySettings.galleryImages || []).filter((_, i) => i !== index);
    const newSettings = { ...agencySettings, galleryImages: updated };
    setAgencySettings(newSettings);
    await handleUpdateSettings(newSettings);
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carForm.images.length && !carForm.image) {
      alert("Photo requise");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...carForm,
        image: carForm.images[0] || carForm.image,
        pricePerDay: Number(carForm.pricePerDay),
        seats: Number(carForm.seats),
        lastOilChangeKm: Number(carForm.lastOilChangeKm),
        nextOilChangeKm: Number(carForm.nextOilChangeKm),
      };
      if (editingCarId) await carService.update(editingCarId, payload);
      else await carService.create(payload);
      setShowCarModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
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
        date: new Date().toISOString().split('T')[0],
        carId: "",
      });
      loadData();
    } catch (err) {
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(t("common.delete") + "?")) return;
    try {
      await expenseService.delete(id);
      loadData();
    } catch (err) {
      alert(t("common.error"));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const fileReaders = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(fileReaders);
    setCarForm({
      ...carForm,
      images: [...carForm.images, ...results],
      image: carForm.image || results[0],
    });
  };

  const removeCarImage = (index: number) => {
    const images = carForm.images.filter((_, idx) => idx !== index);
    setCarForm({ ...carForm, images, image: images[0] || "" });
  };

  const handleEditCar = (car: Car) => {
    setEditingCarId(car._id || null);
    setCarForm({
      brand: car.brand,
      model: car.model,
      category: car.category || "Luxe",
      pricePerDay: car.pricePerDay.toString(),
      image: car.image || "",
      images: car.images || [],
      videoUrl: car.videoUrl || "",
      fuel: car.fuel || "Essence",
      seats: car.seats.toString(),
      speed: car.speed || "250 km/h",
      available: car.available,
      status: car.status || "available",
      insuranceExpiry: car.insuranceExpiry || "",
      technicalVisitExpiry: car.technicalVisitExpiry || "",
      vignetteExpiry: car.vignetteExpiry || "",
      lastOilChangeKm: car.lastOilChangeKm?.toString() || "",
      nextOilChangeKm: car.nextOilChangeKm?.toString() || "",
    });
    setShowCarModal(true);
  };

  const generateTable = (doc: any, options: any) => {
    try {
      if (typeof doc.autoTable === 'function') {
        doc.autoTable(options);
      } else {
        autoTable(doc, options);
      }
    } catch (e) {
      console.error("Table generation error:", e);
    }
  };

  const getFinalY = (doc: any) => {
    return doc.lastAutoTable?.finalY || 0;
  };

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentBookingForSignature, setCurrentBookingForSignature] = useState<any>(null);
  const signaturePadRef = useRef<HTMLCanvasElement>(null);

  const clearSignature = () => {
    const canvas = signaturePadRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignatureAndGenerate = () => {
    const canvas = signaturePadRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      handleGenerateContract(currentBookingForSignature, signatureData);
      setShowSignatureModal(false);
    }
  };

  const handleGenerateContract = (booking: any, signatureData?: string) => {
    try {
      const doc = new jsPDF();
      const primaryColor = [30, 41, 59]; // Slate 800
      const accentColor = [37, 99, 235]; // Blue 600

      // Premium Header Background
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(0, 0, 210, 60, 'F');
      
      // Logo & Brand
      if (agencySettings.logoUrl) {
        try {
          const format = agencySettings.logoUrl.split(';')[0].split('/')[1]?.toUpperCase() || 'PNG';
          doc.addImage(agencySettings.logoUrl, format, 15, 10, 25, 25);
        } catch (e) {
          doc.setFontSize(22);
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text(agencySettings.name, 15, 25);
        }
      } else {
        doc.setFontSize(22);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(agencySettings.name, 15, 25);
      }

      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("CONTRAT DE LOCATION", 200, 25, { align: "right" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Réf: CTR-${(booking._id || '000000').slice(-6).toUpperCase()}`, 200, 32, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 200, 38, { align: "right" });

      // Agency & Client Info
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("LE LOUEUR (AGENCE)", 15, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(agencySettings.name, 15, 77);
      doc.text(agencySettings.address || '', 15, 82);
      doc.text(`Tél: ${agencySettings.phone || ''}`, 15, 87);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("LE LOCATAIRE (CLIENT)", 120, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(booking.user?.name || "Client", 120, 77);
      doc.text(booking.user?.email || "", 120, 82);
      doc.text("CIN/Passeport: .................................", 120, 87);

      // Vehicle Details
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, 100, 180, 8, 'F');
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("DÉTAILS DU VÉHICULE ET DE LA RÉSERVATION", 20, 105.5);

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
      
      generateTable(doc, {
        startY: 112,
        head: [['VÉHICULE', 'MODÈLE', 'DÉBUT', 'FIN', 'DURÉE']],
        body: [[
          booking.carInfo?.brand || '',
          booking.carInfo?.model || '',
          booking.startDate,
          booking.endDate,
          `${days} Jour(s)`
        ]],
        headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        theme: 'grid'
      });

      // Financial Details
      const subtotal = booking.totalAmount || 0;
      const taxRate = Number(agencySettings.taxRate) || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const finalY = getFinalY(doc) + 15;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("RÉSUMÉ FINANCIER", 15, finalY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Prix de location HT:", 15, finalY + 8);
      doc.text(`${subtotal.toFixed(2)} ${agencySettings.currency}`, 80, finalY + 8);
      doc.text(`TVA (${taxRate}%):`, 15, finalY + 14);
      doc.text(`${taxAmount.toFixed(2)} ${agencySettings.currency}`, 80, finalY + 14);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("TOTAL À PAYER TTC:", 15, finalY + 22);
      doc.text(`${total.toFixed(2)} ${agencySettings.currency}`, 80, finalY + 22);

      // Signature Section
      const sigY = finalY + 45;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("SIGNATURE DU LOUEUR", 15, sigY);
      doc.text("SIGNATURE DU LOCATAIRE", 120, sigY);

      doc.setDrawColor(200);
      doc.rect(15, sigY + 5, 75, 35);
      doc.rect(120, sigY + 5, 75, 35);

      if (signatureData) {
        doc.addImage(signatureData, 'PNG', 122, sigY + 7, 70, 30);
      }

      // Terms
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text("Conditions: Le véhicule doit être rendu dans le même état qu'à la livraison. Le carburant est à la charge du locataire.", 15, 280);
      doc.text("Contrat généré électroniquement par " + agencySettings.name, 105, 285, { align: "center" });

      doc.save(`Contrat_${(booking._id || '000000').slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error("Contract Generation Error:", err);
      alert("Erreur lors de la génération du contrat.");
    }
  };

  const handleGenerateInvoice = (booking: any) => {
    try {
      const doc = new jsPDF();
      const primaryColor = [30, 41, 59]; // Slate 800
      const accentColor = [22, 163, 74]; // Green 600 for Invoices

      // Premium Header Background
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(0, 0, 210, 60, 'F');
      
      // Logo & Brand
      if (agencySettings.logoUrl) {
        try {
          const format = agencySettings.logoUrl.split(';')[0].split('/')[1]?.toUpperCase() || 'PNG';
          doc.addImage(agencySettings.logoUrl, format, 15, 10, 25, 25);
        } catch (e) {
          doc.setFontSize(22);
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.text(agencySettings.name, 15, 25);
        }
      } else {
        doc.setFontSize(22);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(agencySettings.name, 15, 25);
      }

      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURE", 200, 25, { align: "right" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`N°: ${booking.invoiceNumber || 'INV-000000'}`, 200, 32, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 200, 38, { align: "right" });

      // Agency & Client Info
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("ÉMETTEUR", 15, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(agencySettings.name, 15, 77);
      doc.text(agencySettings.address || '', 15, 82);
      doc.text(`Tél: ${agencySettings.phone || ''}`, 15, 87);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("DESTINATAIRE", 120, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(booking.user?.name || "Client", 120, 77);
      doc.text(booking.user?.email || "", 120, 82);

      // Details
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, 100, 180, 8, 'F');
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("DÉTAILS DE LA PRESTATION", 20, 105.5);

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
      
      generateTable(doc, {
        startY: 112,
        head: [['DÉSIGNATION', 'PRIX UNIT. (HT)', 'QTÉ', 'TOTAL (HT)']],
        body: [[
          `Location ${booking.carInfo?.brand} ${booking.carInfo?.model} (${booking.startDate} au ${booking.endDate})`,
          `${booking.carInfo?.pricePerDay} ${agencySettings.currency}`,
          `${days} Jour(s)`,
          `${booking.totalAmount} ${agencySettings.currency}`
        ]],
        headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        theme: 'grid'
      });

      // Financial Total
      const subtotal = booking.totalAmount || 0;
      const taxRate = Number(agencySettings.taxRate) || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const finalY = getFinalY(doc) + 15;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("RÉCAPITULATIF FINANCIER", 130, finalY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sous-total HT:", 130, finalY + 8);
      doc.text(`${subtotal.toFixed(2)} ${agencySettings.currency}`, 180, finalY + 8, { align: "right" });
      doc.text(`TVA (${taxRate}%):`, 130, finalY + 14);
      doc.text(`${taxAmount.toFixed(2)} ${agencySettings.currency}`, 180, finalY + 14, { align: "right" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("TOTAL TTC À PAYER:", 130, finalY + 24);
      doc.text(`${total.toFixed(2)} ${agencySettings.currency}`, 180, finalY + 24, { align: "right" });

      doc.save(`Facture_${booking.invoiceNumber || '000000'}.pdf`);
    } catch (err) {
      console.error("Invoice Generation Error:", err);
      alert("Erreur lors de la génération de la facture.");
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signaturePadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    (canvas as any).isDrawing = true;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signaturePadRef.current;
    if (!canvas || !(canvas as any).isDrawing) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = signaturePadRef.current;
    if (canvas) (canvas as any).isDrawing = false;
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [37, 99, 235];
      
      doc.setFontSize(20);
      doc.text(t("admin.charts.volume").toUpperCase(), 105, 20, { align: "center" });
      doc.setFontSize(14);
      doc.text(agencySettings.name.toUpperCase(), 105, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${t("common.date")} : ${new Date().toLocaleString()}`, 20, 45);
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${t("admin.stats.revenue")} : ${revenue || 0} ${agencySettings.currency}`, 20, 55);
      doc.text(`${t("admin.stats.expenses")} : ${totalExpenses || 0} ${agencySettings.currency}`, 20, 62);
      doc.text(`${t("admin.stats.profit")} : ${netProfit || 0} ${agencySettings.currency}`, 20, 69);

      let currentY = 80;

      if (statistics?.monthly && statistics.monthly.length > 0) {
        const tableBody = statistics.monthly.map(m => [
          m.name || '', 
          (m.revenue || 0).toString(), 
          (m.expenses || 0).toString(), 
          (m.bookings || 0).toString()
        ]);

        generateTable(doc, {
          startY: currentY,
          head: [[t("common.date"), t("admin.stats.revenue"), t("admin.stats.expenses"), t("admin.stats.bookings")]],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: primaryColor as any }
        });
        currentY = getFinalY(doc) + 15;
      }

      if (statistics?.topCars && statistics.topCars.length > 0) {
        const carBody = statistics.topCars.map(c => [
          c.name || '', 
          (c.count || 0).toString(), 
          (c.revenue || 0).toString()
        ]);

        generateTable(doc, {
          startY: currentY,
          head: [[t("admin.charts.performance"), t("admin.stats.bookings"), t("admin.stats.revenue")]],
          body: carBody,
          theme: 'striped',
          headStyles: { fillColor: primaryColor as any }
        });
      }

      doc.save(`Rapport_Activite_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: any) {
      console.error("Critical PDF Export Error:", err);
      alert(t("common.error") + ": " + (err?.message || ""));
    }
  };

  const exportToExcel = () => {
    const wsData = [
      [t("admin.charts.volume") + " - " + agencySettings.name],
      [t("common.date"), new Date().toLocaleString()],
      [],
      [t("admin.suite")],
      [t("admin.stats.revenue"), revenue, agencySettings.currency],
      [t("admin.stats.expenses"), totalExpenses, agencySettings.currency],
      [t("admin.stats.profit"), netProfit, agencySettings.currency],
      [],
      [t("admin.charts.flux")],
      [t("common.date"), t("admin.stats.revenue"), t("admin.stats.expenses"), t("admin.stats.bookings")],
      ...statistics.monthly.map(m => [m.name, m.revenue, m.expenses, m.bookings]),
      [],
      [t("admin.charts.performance")],
      [t("cars.brand"), t("admin.stats.bookings"), t("admin.stats.revenue")],
      ...statistics.topCars.map(c => [c.name, c.count, c.revenue])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("admin.tabs.analytics"));
    XLSX.writeFile(wb, `Rapport_Activite_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const resetForm = () => {
    setCarForm({
      brand: "", model: "", category: "Luxe", pricePerDay: "", image: "", images: [], videoUrl: "",
      fuel: "Essence", seats: "5", speed: "250 km/h", available: true, status: "available",
      insuranceExpiry: "", technicalVisitExpiry: "", vignetteExpiry: "", lastOilChangeKm: "", nextOilChangeKm: "",
    });
    setEditingCarId(null);
  };

  const handleUpdateUserPremium = async (id: string, data: any) => {
    try {
      await updateUserPremium(id, data);
      loadData();
    } catch (err) {
      alert("Erreur lors de la mise à jour premium");
    }
  };

  const handleWhatsAppShare = (booking: Reservation) => {
    const message = `Bonjour ${booking.user?.name}, votre réservation pour la ${booking.carInfo?.brand} ${booking.carInfo?.model} du ${booking.startDate} au ${booking.endDate} est confirmée. Total: ${booking.totalAmount} ${agencySettings.currency}. Merci de votre confiance!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveInspection = async () => {
    if (!currentBookingForInspection?._id) return;
    setIsSubmitting(true);
    try {
      await bookingService.updateInspection(currentBookingForInspection._id, {
        type: inspectionType,
        photos: inspectionForm.photos,
        notes: inspectionForm.notes
      });
      setShowInspectionModal(false);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'état des lieux");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectionPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const fileReaders = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    const results = await Promise.all(fileReaders);
    setInspectionForm(prev => ({ ...prev, photos: [...prev.photos, ...results] }));
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingInventoryId) {
        await inventoryService.update(editingInventoryId, inventoryForm);
      } else {
        await inventoryService.create(inventoryForm);
      }
      setShowInventoryModal(false);
      setEditingInventoryId(null);
      setInventoryForm({ name: "", quantity: 0, minQuantity: 5, category: "Maintenance", price: 0 });
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'inventaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await inventoryService.delete(id);
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      inventoryService.getAll().then(setInventory);
    }
  }, [activeTab]);

  const { revenue, totalExpenses, netProfit, statistics, categoryProfitability } = useMemo(() => {
    const rev = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const exp = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Category profitability
    const categories = Array.from(new Set(cars.map(c => c.category)));
    const catData = categories.map(cat => {
      const catBookings = bookings.filter(b => b.carInfo?.category === cat || cars.find(c => c._id === b.carId)?.category === cat);
      const catRevenue = catBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
      return { name: cat, value: catRevenue };
    }).filter(c => c.value > 0);

    // Process monthly stats
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const monthlyData = months.map((name, index) => {
      const monthBookings = bookings.filter(b => new Date(b.startDate).getMonth() === index);
      const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === index);
      return {
        name,
        revenue: monthBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
        expenses: monthExpenses.reduce((acc, e) => acc + e.amount, 0),
        bookings: monthBookings.length
      };
    }).slice(Math.max(0, currentMonth - 5), currentMonth + 1);

    // Car popularity
    const carStats = cars.map(car => ({
      name: `${car.brand} ${car.model}`,
      count: bookings.filter(b => b.carId === car._id).length,
      revenue: bookings.filter(b => b.carId === car._id).reduce((acc, b) => acc + (b.totalAmount || 0), 0)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return { 
      revenue: rev, 
      totalExpenses: exp, 
      netProfit: rev - exp,
      statistics: {
        monthly: monthlyData,
        topCars: carStats
      },
      categoryProfitability: catData
    };
  }, [bookings, expenses, cars]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <Header user={user} />
      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-blue-500/20">
              <LayoutDashboard className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black dark:text-white uppercase tracking-tighter">{t("admin.suite")}</h1>
              <p className="text-gray-500 font-bold uppercase text-[8px] sm:text-[10px] tracking-[0.2em]">{t("admin.management")}</p>
            </div>
          </div>
          <div className="flex flex-nowrap gap-1.5 sm:gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: "overview", label: t("admin.tabs.dashboard"), icon: LayoutDashboard },
              { id: "planning", label: t("admin.tabs.planning"), icon: CalendarDays },
              { id: "accounting", label: "Comptabilité", icon: Wallet },
              { id: "inventory", label: t("admin.tabs.inventory"), icon: Package },
              { id: "fleet_control", label: "Fleet", icon: ShieldCheck },
              { id: "cars", label: t("admin.tabs.fleet"), icon: CarIcon },
              { id: "bookings", label: t("admin.tabs.sales"), icon: Calendar },
              { id: "services", label: "Services", icon: Zap },
              { id: "crm", label: t("admin.tabs.crm"), icon: Users },
              { id: "reports", label: t("admin.tabs.analytics"), icon: BarChart3 },
              { id: "expenses", label: t("admin.tabs.expenses"), icon: Receipt },
              { id: "gallery", label: t("admin.tabs.gallery"), icon: ImageIcon },
              { id: "settings", label: t("admin.tabs.settings"), icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <tab.icon size={14} className="sm:w-4 sm:h-4" />
                <span className={activeTab === tab.id ? "inline" : "hidden md:inline"}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest animate-pulse">{t("common.loading")}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.live_performance")}</h2>
                    <p className="text-gray-500 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest mt-1">Avenir Kamil Car | {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                    <button onClick={loadData} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm">
                      <RefreshCw size={12} className={`text-blue-600 ${loading ? 'animate-spin' : ''}`} /> {t("nav.language") === "Langue" ? "ACTUALISER" : "REFRESH"}
                    </button>
                    <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm"><Download size={12} className="text-blue-600" /> {t("admin.exports.pdf").split(' ')[1] || "PDF"}</button>
                    <button onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm"><Download size={12} className="text-green-600" /> {t("admin.exports.excel").split(' ')[1] || "EXCEL"}</button>
                  </div>
                </div>
                
                {alerts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {alerts.map((alert, idx) => (
                      <div key={idx} className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex items-center gap-3 sm:gap-4 ${alert.severity === 'high' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}><AlertTriangle size={18} className="sm:w-5 sm:h-5" /></div>
                        <div>
                          <p className="font-black uppercase text-[8px] sm:text-[10px] tracking-widest opacity-60">{t("common.date")} {alert.type}</p>
                          <p className="text-xs sm:text-sm font-bold dark:text-white">{alert.car} : {alert.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: t("admin.stats.revenue"), value: `${financialSummary?.revenue || 0} ${agencySettings.currency}`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", trend: `+${financialSummary?.revenueGrowth || 0}%` },
                    { label: t("admin.stats.expenses"), value: `${financialSummary?.totalExpenses || 0} ${agencySettings.currency}`, icon: Wallet, color: "text-red-500", bg: "bg-red-500/10", trend: "-2.4%" },
                    { label: t("admin.stats.profit"), value: `${financialSummary?.netProfit || 0} ${agencySettings.currency}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", trend: "+18.2%" },
                    { label: t("admin.dashboard.excellent"), value: `${financialSummary?.fleetHealth || 0}%`, icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Stable" },
                  ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="p-4 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:scale-110 transition-transform ${stat.color}`}><stat.icon size={48} className="sm:w-16 sm:h-16" /></div>
                      <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2"><stat.icon size={10} className="sm:w-3 sm:h-3" /> {stat.label}</p>
                      <div className="flex items-end gap-1 md:gap-2"><p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p></div>
                      <div className={`mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} px-2 sm:px-3 py-1 rounded-full w-fit`}><ArrowUpRight size={10} /> {stat.trend}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
                      <h3 className="text-lg sm:text-2xl font-black dark:text-white uppercase tracking-tighter">{t("admin.charts.flux")}</h3>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2"><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-600"></div><span className="text-[7px] sm:text-[10px] font-black dark:text-gray-400 uppercase">{t("admin.stats.revenue")}</span></div>
                        <div className="flex items-center gap-1.5 sm:gap-2"><div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div><span className="text-[7px] sm:text-[10px] font-black dark:text-gray-400 uppercase">{t("admin.stats.expenses")}</span></div>
                      </div>
                    </div>
                    <div className="h-[250px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyStats}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 'bold'}} 
                          />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', backgroundColor: '#0f172a', color: '#fff'}}
                            itemStyle={{fontWeight: 'black', textTransform: 'uppercase', fontSize: '8px'}}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg sm:text-2xl font-black dark:text-white mb-6 sm:mb-8 uppercase tracking-tighter">{t("admin.charts.performance")}</h3>
                    <div className="space-y-6 sm:space-y-8">
                      {carPerformance.slice(0, 5).map((car, idx) => (
                        <div key={idx} className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-xs sm:text-sm font-black dark:text-white uppercase tracking-tight truncate max-w-[150px]">{car.name}</p>
                            <p className="text-[10px] sm:text-xs font-black text-blue-600 shrink-0">{car.bookingCount} loc.</p>
                          </div>
                          <div className="h-1.5 sm:h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(car.bookingCount / (financialSummary?.bookingCount || 1)) * 100}%` }}
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                            />
                          </div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{car.revenue} {agencySettings.currency} generated</p>
                        </div>
                      ))}
                      {carPerformance.length === 0 && (
                        <div className="py-10 sm:py-20 text-center">
                          <Activity className="mx-auto text-gray-200 dark:text-gray-800 mb-4" size={32} />
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.dashboard.no_data")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "planning" && (
              <motion.div key="planning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.planning.title")}</h2>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{t("admin.planning.subtitle")}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => setPlanningDate(new Date(planningDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="px-6 font-black dark:text-white uppercase text-[10px] tracking-widest">
                      {planningDate.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button 
                      onClick={() => setPlanningDate(new Date(planningDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <div className="min-w-[1000px]">
                      {/* Calendar Header (Days) */}
                      <div className="grid grid-cols-[250px_repeat(7,1fr)] border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="p-8 font-black uppercase text-[10px] text-gray-400 tracking-widest border-r border-gray-100 dark:border-gray-800">{t("admin.planning.vehicles")}</div>
                        {[...Array(7)].map((_, i) => {
                          const date = new Date(planningDate);
                          date.setDate(date.getDate() - date.getDay() + i);
                          const isToday = new Date().toDateString() === date.toDateString();
                          return (
                            <div key={i} className={`p-6 text-center border-r border-gray-100 dark:border-gray-800 last:border-0 ${isToday ? 'bg-blue-600/5' : ''}`}>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                {date.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' })}
                              </p>
                              <p className={`text-xl font-black mt-1 ${isToday ? 'text-blue-600' : 'dark:text-white'}`}>
                                {date.getDate()}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Calendar Rows (Cars) */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cars.map(car => (
                          <div key={car._id} className="grid grid-cols-[250px_repeat(7,1fr)] hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-all">
                            <div className="p-6 border-r border-gray-100 dark:border-gray-800 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={car.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black dark:text-white uppercase text-[10px] tracking-tight truncate">{car.brand} {car.model}</p>
                                <p className="text-[8px] font-bold text-blue-500 uppercase">{car.category}</p>
                              </div>
                            </div>
                            
                            {[...Array(7)].map((_, i) => {
                              const date = new Date(planningDate);
                              date.setDate(date.getDate() - date.getDay() + i);
                              const dateStr = date.toISOString().split('T')[0];
                              
                              const booking = bookings.find(b => 
                                b.carId === car._id && 
                                b.status !== 'cancelled' &&
                                dateStr >= b.startDate && 
                                dateStr <= b.endDate
                              );

                              return (
                                <div key={i} className="p-2 border-r border-gray-100 dark:border-gray-800 last:border-0 relative h-20 flex items-center justify-center">
                                  {booking && (
                                    <motion.div 
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className={`absolute inset-1 rounded-xl p-2 flex flex-col justify-center cursor-pointer hover:brightness-110 transition-all ${
                                        booking.status === 'confirmed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                      }`}
                                      onClick={() => {
                                        setCurrentBookingForSignature(booking);
                                        setActiveTab('bookings');
                                      }}
                                    >
                                      <p className="text-[8px] font-black uppercase truncate leading-tight">{booking.user?.name || "Client"}</p>
                                      <p className="text-[6px] font-bold opacity-80 uppercase mt-0.5">{booking.status}</p>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.inventory.title")}</h2>
                    <p className="text-gray-500 font-bold text-[8px] sm:text-xs uppercase tracking-widest mt-1">{t("admin.inventory.subtitle")}</p>
                  </div>
                  <button 
                    onClick={() => { setEditingInventoryId(null); setInventoryForm({ name: "", quantity: 0, minQuantity: 5, category: "Maintenance", price: 0 }); setShowInventoryModal(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all text-[10px] sm:text-xs uppercase tracking-widest"
                  >
                    <Plus size={18} /> {t("admin.inventory.add_btn")}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {['maintenance', 'consumables', 'parts', 'cleaning'].map(catKey => (
                    <div key={catKey} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
                      <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">{t(`inventory.${catKey}`)}</p>
                      <p className="text-xl sm:text-3xl font-black dark:text-white">{inventory.filter(i => i.category.toLowerCase() === t(`inventory.${catKey}`).toLowerCase() || i.category.toLowerCase() === catKey).length} <span className="text-[10px] text-gray-500">{t("admin.inventory.items")}</span></p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("admin.inventory.designation")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("common.category")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("admin.inventory.stock")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("admin.inventory.unit_price")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {inventory.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="font-black dark:text-white uppercase tracking-tight text-xs sm:text-base">{item.name}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.quantity <= item.minQuantity ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                <span className={`font-black text-xs sm:text-base ${item.quantity <= item.minQuantity ? 'text-red-500' : 'dark:text-white'}`}>{item.quantity}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 font-bold dark:text-gray-300 text-xs sm:text-base">{item.price || 0} {agencySettings.currency}</td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setEditingInventoryId(item._id!); setInventoryForm({ name: item.name, quantity: item.quantity, minQuantity: item.minQuantity, category: item.category, price: item.price || 0 }); setShowInventoryModal(true); }} className="p-2 sm:p-3 bg-blue-600/10 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteInventory(item._id!)} className="p-2 sm:p-3 bg-red-500/10 text-red-500 rounded-lg sm:rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {inventory.length === 0 && (
                          <tr><td colSpan={5} className="px-4 sm:px-8 py-10 sm:py-20 text-center text-gray-400 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest">{t("admin.inventory.empty")}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "accounting" && (
              <motion.div key="accounting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <AccountingSuite 
                  financialSummary={financialSummary}
                  monthlyStats={monthlyStats}
                  carPerformance={carPerformance}
                  expenseBreakdown={expenseBreakdown}
                  bookings={bookings}
                  expenses={expenses}
                  currency={agencySettings.currency}
                  onAddExpense={() => setShowExpenseModal(true)}
                  onViewReports={() => setActiveTab("reports")}
                />
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.reservations_registry")}</h2>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-sm">
                      <Calendar size={14} className="text-blue-600" /> {bookings.length} TOTAL
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("admin.dashboard.ref_vehicle")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("common.client")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("admin.dashboard.period")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("common.amount")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("common.status")}</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest text-right whitespace-nowrap">{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="font-black dark:text-white uppercase tracking-tight text-xs sm:text-base">{(booking._id || '000000').slice(-6).toUpperCase()}</div>
                              <div className="text-[8px] sm:text-[10px] text-blue-500 font-bold uppercase tracking-widest truncate max-w-[120px]">{booking.carInfo?.brand} {booking.carInfo?.model}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="font-bold dark:text-white text-xs sm:text-base">{booking.user?.name || t("common.client")}</div>
                              <div className="text-[8px] sm:text-[10px] text-gray-400 truncate max-w-[120px]">{booking.user?.email}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="text-[10px] sm:text-xs font-bold dark:text-gray-300 flex items-center gap-1 sm:gap-2"><Clock size={10} /> {booking.startDate}</div>
                              <div className="text-[10px] sm:text-xs font-bold text-gray-400 flex items-center gap-1 sm:gap-2"><ChevronRight size={10} /> {booking.endDate}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="text-sm sm:text-lg font-black text-blue-600 whitespace-nowrap">{booking.totalAmount} {agencySettings.currency}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
                                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {booking.status === 'confirmed' ? t("common.status_confirmed") : booking.status === 'pending' ? t("common.status_pending") : t("common.status_cancelled")}
                              </span>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                              <div className="flex justify-end gap-1.5 sm:gap-2">
                                <button 
                                  onClick={() => handleWhatsAppShare(booking)}
                                  className="p-2 sm:p-3 bg-green-500 text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all shadow-lg shadow-green-500/20"
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setCurrentBookingForInspection(booking);
                                    setInspectionType(booking.status === 'confirmed' ? 'check-in' : 'check-out');
                                    setInspectionForm({ photos: [], notes: "" });
                                    setShowInspectionModal(true);
                                  }}
                                  className="p-2 sm:p-3 bg-amber-500 text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
                                  title={t("admin.inspection.title")}
                                >
                                  <Camera size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setCurrentBookingForSignature(booking);
                                    setShowSignatureModal(true);
                                  }}
                                  className="p-2 sm:p-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                                  title={t("admin.dashboard.contract_validation")}
                                >
                                  <FileText size={16} />
                                </button>
                                <button 
                                  onClick={() => handleGenerateInvoice(booking)}
                                  className="p-2 sm:p-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                                  title="Facture"
                                >
                                  <Receipt size={16} />
                                </button>
                                {booking.status === 'pending' && (
                                  <button 
                                    onClick={() => {
                                      if(confirm(t("common.confirm") + "?")) {
                                        bookingService.updateStatus(booking._id!, 'confirmed').then(loadData);
                                      }
                                    }}
                                    className="p-2 sm:p-3 bg-green-500/10 text-green-500 rounded-lg sm:rounded-xl hover:bg-green-500 hover:text-white transition-all"
                                    title={t("common.confirm")}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 sm:px-8 py-10 sm:py-20 text-center text-gray-400 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest">{t("admin.dashboard.no_reservations")}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div key="reports" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.charts.volume")}</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                    <button onClick={loadData} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm">
                      <RefreshCw size={14} className={`text-blue-600 ${loading ? 'animate-spin' : ''}`} /> {t("nav.language") === "Langue" ? "ACTUALISER" : "REFRESH"}
                    </button>
                    <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm"><Download size={14} className="text-blue-600" /> {t("admin.exports.pdf").split(' ')[1] || "PDF"}</button>
                    <button onClick={exportToExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm"><Download size={14} className="text-green-600" /> {t("admin.exports.excel").split(' ')[1] || "EXCEL"}</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                  <div className="bg-white dark:bg-gray-900 p-6 sm:p-12 rounded-2xl sm:rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8 sm:mb-12">
                      <div>
                        <h3 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.charts.profitability_cat")}</h3>
                        <p className="text-gray-500 font-bold text-[8px] sm:text-xs uppercase tracking-widest mt-1">{t("admin.dashboard.total_revenue")}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl sm:rounded-3xl"><TrendingUp size={20} className="sm:w-6 sm:h-6" /></div>
                    </div>
                    <div className="h-[250px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie 
                            data={categoryProfitability} 
                            cx="50%" cy="50%" innerRadius={window.innerWidth < 640 ? 60 : 80} outerRadius={window.innerWidth < 640 ? 80 : 110} paddingAngle={8} dataKey="value"
                          >
                            {categoryProfitability.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][index % 4]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
                      {categoryProfitability.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][idx % 4]}} />
                          <span className="text-[8px] sm:text-[10px] font-black dark:text-gray-300 uppercase truncate">{item.name}: {item.value} {agencySettings.currency}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-6 sm:p-12 rounded-2xl sm:rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8 sm:mb-12">
                      <div>
                        <h3 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.flux_cash")}</h3>
                        <p className="text-gray-500 font-bold text-[8px] sm:text-xs uppercase tracking-widest mt-1">{t("admin.charts.rev_vs_exp")}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-blue-500/10 text-blue-600 rounded-2xl sm:rounded-3xl"><LineChartIcon size={20} className="sm:w-6 sm:h-6" /></div>
                    </div>
                    <div className="h-[250px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={statistics.monthly}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                          <Tooltip />
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black p-6 sm:p-12 rounded-2xl sm:rounded-[4rem] shadow-2xl border border-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10 text-center md:text-left">
                    <div className="space-y-2 sm:space-y-4">
                      <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter">{t("admin.charts.health")}</h3>
                      <p className="text-gray-400 font-bold text-[10px] sm:text-sm uppercase tracking-[0.2em]">{t("admin.dashboard.excellent_desc") || "Basé sur la croissance semestrielle"}</p>
                    </div>
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx={window.innerWidth < 640 ? "64" : "80"} cy={window.innerWidth < 640 ? "64" : "80"} r={window.innerWidth < 640 ? "56" : "70"} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-800" />
                        <motion.circle 
                          cx={window.innerWidth < 640 ? "64" : "80"} cy={window.innerWidth < 640 ? "64" : "80"} r={window.innerWidth < 640 ? "56" : "70"} stroke="currentColor" strokeWidth="10" fill="transparent" 
                          strokeDasharray={window.innerWidth < 640 ? 352 : 440} 
                          initial={{ strokeDashoffset: window.innerWidth < 640 ? 352 : 440 }}
                          animate={{ strokeDashoffset: (window.innerWidth < 640 ? 352 : 440) - ((window.innerWidth < 640 ? 352 : 440) * 0.85) }}
                          className="text-blue-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-4xl font-black text-white">85%</span>
                        <span className="text-[7px] sm:text-[8px] font-black text-blue-400 tracking-[0.3em] uppercase">{t("admin.dashboard.excellent")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "expenses" && (
              <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.expenses.title")}</h2>
                  <button onClick={() => setShowExpenseModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all text-[10px] sm:text-xs uppercase tracking-widest"><Plus size={18} /> {t("admin.expenses.add_btn")}</button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
                  <div className="bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 sm:mb-2">{t("admin.expenses.total")}</p>
                    <p className="text-xl sm:text-4xl font-black dark:text-white text-red-500 truncate">{totalExpenses} <span className="text-[10px]">{agencySettings.currency}</span></p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 sm:mb-2">{t("admin.expenses.count")}</p>
                    <p className="text-xl sm:text-4xl font-black dark:text-white">{expenses.length}</p>
                  </div>
                  <div className="hidden sm:block bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{t("admin.expenses.average")}</p>
                    <p className="text-4xl font-black dark:text-white">
                      {expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0} {agencySettings.currency}
                    </p>
                  </div>
                </div>

                {/* Mobile Expenses Cards */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {expenses.map(e => (
                    <div key={e._id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-black dark:text-white uppercase tracking-tight text-sm">{e.title}</div>
                          <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{e.date}</div>
                        </div>
                        <button onClick={() => handleDeleteExpense(e._id!)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          e.category === 'maintenance' ? 'bg-amber-500/10 text-amber-600' :
                          e.category === 'fuel' ? 'bg-blue-500/10 text-blue-600' :
                          e.category === 'insurance' ? 'bg-purple-500/10 text-purple-600' :
                          'bg-gray-500/10 text-gray-600'
                        }`}>
                          {e.category === 'maintenance' ? t("inventory.maintenance") : e.category === 'fuel' ? t("admin.fleet.fuel") : e.category === 'insurance' ? t("admin.dashboard.insurance_label").replace(':','') : e.category}
                        </span>
                        <div className="font-black dark:text-white text-base text-red-500">{e.amount} {agencySettings.currency}</div>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="py-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t("admin.dashboard.no_expenses")}</div>
                  )}
                </div>

                {/* Desktop Expenses Table */}
                <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("admin.expenses.designation")}</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("admin.expenses.category")}</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t("common.date")}</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">{t("admin.expenses.amount")}</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {expenses.map(e => (
                          <tr key={e._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                            <td className="px-8 py-6">
                              <div className="font-black dark:text-white uppercase tracking-tight">{e.title}</div>
                              {e.carId && (
                                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                                  Véhicule ID: {e.carId.slice(-6)}
                                </div>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                e.category === 'maintenance' ? 'bg-amber-500/10 text-amber-600' :
                                e.category === 'fuel' ? 'bg-blue-500/10 text-blue-600' :
                                e.category === 'insurance' ? 'bg-purple-500/10 text-purple-600' :
                                'bg-gray-500/10 text-gray-600'
                              }`}>
                                {e.category === 'maintenance' ? t("inventory.maintenance") : e.category === 'fuel' ? t("admin.fleet.fuel") : e.category === 'insurance' ? t("admin.dashboard.insurance_label").replace(':','') : e.category}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-500">{e.date}</td>
                            <td className="px-8 py-6 text-right font-black dark:text-white">{e.amount} {agencySettings.currency}</td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => handleDeleteExpense(e._id!)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t("admin.dashboard.no_expenses")}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "cars" && (
              <motion.div key="cars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.fleet_management")}</h2>
                  <button onClick={() => { resetForm(); setShowCarModal(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all text-[10px] sm:text-xs uppercase tracking-widest"><Plus size={18} /> {t("admin.fleet.add_car")}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {cars.map(car => (
                    <div key={car._id} className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl group">
                      <div className="h-48 sm:h-60 overflow-hidden relative">
                        <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className={`absolute top-4 sm:top-6 right-4 sm:right-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black tracking-widest text-white shadow-lg ${car.available ? "bg-green-500" : "bg-red-500"}`}>{car.available ? t("cars.available") : t("cars.rented")}</div>
                      </div>
                      <div className="p-6 sm:p-8">
                        <h3 className="text-xl sm:text-2xl font-black dark:text-white">{car.brand} {car.model}</h3>
                        <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6">{car.category}</p>
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                          <p className="text-2xl sm:text-3xl font-black text-blue-600">{car.pricePerDay} <span className="text-[10px] sm:text-xs">{agencySettings.currency}</span></p>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 font-bold text-[10px] sm:text-xs"><Zap size={14} className="text-amber-500" /> {car.fuel}</div>
                        </div>
                        <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                          <button onClick={() => handleEditCar(car)} className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all text-[8px] sm:text-[10px] uppercase tracking-widest"><Edit size={16} /> {t("common.edit")}</button>
                          <button onClick={() => { if(confirm(t("common.delete") + "?")) carService.delete(car._id!).then(loadData) }} className="p-3 sm:p-4 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} sm:size={20} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.services_management")}</h2>
                  <button onClick={() => { setEditingServiceId(null); setServiceForm({title:"", description:"", icon:"Zap", color:"blue", stats:"100%", statLabel:"", category:"tech", highlights:["","",""]}); setShowServiceModal(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all text-[10px] sm:text-xs uppercase tracking-widest"><Plus size={18} /> {t("admin.dashboard.add_service")}</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {services.map(service => (
                    <div key={service._id} className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl group">
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-${service.color}-500/10 text-${service.color}-500`}><Zap size={20} sm:size={24} /></div>
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{service.category}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black dark:text-white mb-2 uppercase tracking-tight">{service.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 line-clamp-2">{service.description}</p>
                      <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button onClick={() => handleEditService(service)} className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all text-[8px] sm:text-[10px] uppercase tracking-widest"><Edit size={16} /> EDIT</button>
                        <button onClick={() => handleDeleteService(service._id)} className="p-3 sm:p-4 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} sm:size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="col-span-full py-20 sm:py-40 text-center bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[3.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                      <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest">{t("admin.dashboard.no_services")}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "fleet_control" && (
              <motion.div key="fleet_control" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.dashboard.fleet_control")}</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500/10 text-green-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                      {cars.filter(c => c.status === 'available').length} {t("admin.dashboard.available")}
                    </div>
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                      {cars.filter(c => c.status === 'rented').length} {t("cars.rented")}
                    </div>
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                      {cars.filter(c => c.status === 'maintenance').length} {t("admin.dashboard.workshop")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {cars.map(car => (
                    <div key={car._id} className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1.5 sm:w-2 h-full ${
                        car.status === 'available' ? 'bg-green-500' : 
                        car.status === 'rented' ? 'bg-blue-500' : 
                        car.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black dark:text-white uppercase tracking-tight truncate text-sm sm:text-base">{car.brand} {car.model}</h4>
                          <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{car.category}</p>
                        </div>
                        <div className={`p-1.5 sm:p-2 rounded-lg ${car.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {car.available ? <CheckCircle size={14} sm:size={16} /> : <XCircle size={14} sm:size={16} />}
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="flex justify-between text-[8px] sm:text-[10px] font-bold">
                          <span className="text-gray-400 uppercase tracking-widest">{t("admin.dashboard.oil_change_label")}</span>
                          <span className={car.nextOilChangeKm && car.lastOilChangeKm && (car.nextOilChangeKm - car.lastOilChangeKm < 1000) ? 'text-red-500 font-black' : 'dark:text-gray-300'}>
                            {car.nextOilChangeKm ? `${car.nextOilChangeKm} Km` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[8px] sm:text-[10px] font-bold">
                          <span className="text-gray-400 uppercase tracking-widest">{t("admin.dashboard.insurance_label")}</span>
                          <span className="dark:text-gray-300">{car.insuranceExpiry || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleUpdateCarStatus(car._id!, 'available', true)}
                          className={`py-2 rounded-lg sm:rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${car.status === 'available' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-green-500/10'}`}
                        >{t("admin.dashboard.available")}</button>
                        <button 
                          onClick={() => handleUpdateCarStatus(car._id!, 'maintenance', false)}
                          className={`py-2 rounded-lg sm:rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${car.status === 'maintenance' ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-amber-500/10'}`}
                        >{t("admin.dashboard.workshop")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "crm" && (
              <motion.div key="crm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter">{t("admin.tabs.crm_title") || "Gestion de la Relation Client (CRM)"}</h2>
                  <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full sm:w-auto">
                    <Search size={18} className="text-gray-400" />
                    <input placeholder={t("common.search") + "..."} className="bg-transparent border-none outline-none dark:text-white font-bold text-xs sm:text-base w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {users.filter(u => u.role !== 'superadmin').map(client => (
                    <div key={client._id} className={`bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl group hover:scale-[1.02] transition-all relative overflow-hidden ${client.isBlacklisted ? 'opacity-75 grayscale' : ''}`}>
                      {client.isBlacklisted && (
                        <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center">{t("admin.crm.blacklisted") || "Blacklisté"}</div>
                      )}
                      
                      <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className={`relative w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br ${client.isBlacklisted ? 'from-gray-600 to-gray-800' : 'from-indigo-500 to-purple-600'} rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl`}>
                          {client.name?.charAt(0).toUpperCase()}
                          {client.loyaltyPoints && client.loyaltyPoints > 100 && (
                            <div className="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 p-1 sm:p-1.5 bg-amber-400 rounded-full border-2 sm:border-4 border-white dark:border-gray-900 shadow-lg" title="Client Gold">
                              <AwardIcon size={10} sm:size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg sm:text-xl font-black dark:text-white uppercase tracking-tight truncate">{client.name}</h4>
                            {client.loyaltyPoints && client.loyaltyPoints > 500 ? (
                              <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Elite</span>
                            ) : client.loyaltyPoints && client.loyaltyPoints > 200 ? (
                              <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Premium</span>
                            ) : null}
                          </div>
                          <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{client.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm font-bold">
                          <Globe size={14} sm:size={16} className="text-blue-500" /> <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm font-bold">
                          <Briefcase size={14} sm:size={16} className="text-purple-500" /> {bookings.filter(b => b.userId === client._id || b.userId === client.id).length} {t("admin.crm.reservations")}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm font-bold">
                          <AwardIcon size={14} sm:size={16} className="text-amber-500" /> {client.loyaltyPoints || 0} {t("admin.crm.loyalty_points") || "Points Fidélité"}
                        </div>
                      </div>

                      <div className="mt-8 flex gap-3">
                        <button 
                          onClick={() => handleViewClientHistory(client)}
                          className="flex-[2] py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[10px] tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all"
                        >{t("admin.dashboard.notes_observations").split(' ')[0] || "Historique"}</button>
                        <button 
                          onClick={() => handleUpdateUserPremium(client._id || client.id!, { isBlacklisted: !client.isBlacklisted })}
                          className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[10px] tracking-widest uppercase transition-all ${client.isBlacklisted ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}
                          title={client.isBlacklisted ? "Désactiver Blacklist" : "Blacklister"}
                        >
                          {client.isBlacklisted ? <Check size={20} className="mx-auto" /> : <Ban size={20} className="mx-auto" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client._id || client.id!)}
                          className="p-3 sm:p-4 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                        ><Trash2 size={18} sm:size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {showHistoryModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[3rem] shadow-3xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                          <div>
                            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Historique : {selectedClientName}</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedClientBookings.length} Locations au total</p>
                          </div>
                          <button onClick={() => setShowHistoryModal(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar">
                          {selectedClientBookings.map((b, i) => (
                            <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                              <div className="flex items-center gap-6">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"><CarIcon size={24} className="text-blue-600" /></div>
                                <div>
                                  <p className="font-black dark:text-white uppercase tracking-tight">{b.carInfo?.brand} {b.carInfo?.model}</p>
                                  <p className="text-[10px] font-bold text-gray-500 uppercase">{b.startDate} au {b.endDate}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-blue-600">{b.totalAmount} {agencySettings.currency}</p>
                                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{b.status}</span>
                              </div>
                            </div>
                          ))}
                          {selectedClientBookings.length === 0 && (
                            <div className="py-20 text-center text-gray-400 font-bold uppercase text-xs">Aucune réservation pour ce client.</div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "gallery" && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10">
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                  <h2 className="text-3xl font-black dark:text-white mb-10 flex items-center gap-4 uppercase tracking-tighter"><ImageIcon className="text-blue-600 w-8 h-8" /> {t("gallery.title")}</h2>
                  <div className="grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">URL Image</label>
                        <input value={galleryImageUrl} onChange={(e) => setGalleryImageUrl(e.target.value)} placeholder={t("gallery.url_placeholder")} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:text-white" />
                        <button onClick={addGalleryImage} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all uppercase text-[10px] tracking-widest">{t("gallery.add_btn")}</button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{t("gallery.stats_video")} (YouTube/MP4)</label>
                        <input value={agencySettings.galleryVideoUrl} onChange={(e) => setAgencySettings({...agencySettings, galleryVideoUrl: e.target.value})} placeholder="URL de la vidéo" className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 dark:text-white" />
                      </div>
                      <button onClick={() => handleUpdateSettings()} disabled={isSubmitting} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                        {isSubmitting ? t("auth.processing") : t("common.save")}
                      </button>
                    </div>
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-950 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800">
                      <div className="grid grid-cols-2 gap-4">
                        {(agencySettings.galleryImages || []).map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 group shadow-lg">
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Galerie" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => { if(confirm("Supprimer?")) removeGalleryImage(idx) }} className="p-3 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 transition-all"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))}
                        {(!agencySettings.galleryImages || agencySettings.galleryImages.length === 0) && (
                          <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={48} className="opacity-10 mb-4" />
                            <p className="font-bold text-xs uppercase tracking-widest opacity-30">{t("gallery.empty")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                  <h2 className="text-3xl font-black dark:text-white mb-10 flex items-center gap-4 uppercase tracking-tighter"><Settings className="text-blue-600" /> {t("admin.settings.profile")}</h2>
                  
                  <div className="mb-12 p-8 bg-gray-50 dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-inner group">
                      {agencySettings.logoUrl ? (
                        <img src={agencySettings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                      ) : (
                        <ImageIcon size={40} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">{t("admin.settings.logo")}</h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Utilisé pour les factures et les contrats (PNG/JPG)</p>
                      <label className="inline-block px-8 py-3 bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-black text-[10px] tracking-widest uppercase cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                        <Upload size={14} className="inline mr-2" /> {t("admin.settings.change_logo")}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.settings.commercial_name")}</label><input value={agencySettings.name} onChange={(e) => setAgencySettings({ ...agencySettings, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.settings.contact_email")}</label><input value={agencySettings.email} onChange={(e) => setAgencySettings({ ...agencySettings, email: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold" /></div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.settings.currency")}</label><select value={agencySettings.currency} onChange={(e) => setAgencySettings({ ...agencySettings, currency: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold"><option>DH</option><option>$</option></select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.settings.tax")}</label><input type="number" value={agencySettings.taxRate} onChange={(e) => setAgencySettings({ ...agencySettings, taxRate: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 dark:text-white font-bold" /></div>
                    </div>
                  </div>
                  <button onClick={handleUpdateSettings} disabled={isSubmitting} className="w-full mt-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-[10px]">
                    {isSubmitting ? t("auth.processing") : t("admin.settings.update_btn")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* RE-IMPLEMENTED HIGH-FIDELITY CAR MODAL */}
      <AnimatePresence>
        {showCarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCarModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[3.5rem] border border-white/10 shadow-3xl overflow-y-auto max-h-[95vh] no-scrollbar">
              <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-6 sm:px-12 py-6 sm:py-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
                <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3 sm:gap-4">
                  {editingCarId ? <Edit size={20} className="text-blue-600 sm:w-8 sm:h-8" /> : <Plus size={20} className="text-blue-600 sm:w-8 sm:h-8" />}
                  {editingCarId ? t("admin.fleet.edit_car") : t("admin.fleet.add_car")}
                </h2>
                <button onClick={() => setShowCarModal(false)} className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>

              <form onSubmit={handleCarSubmit} className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.car_brand")}</label><input required value={carForm.brand} onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white transition-all text-sm sm:text-base" placeholder="Ex: Porsche" /></div>
                    <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.car_model")}</label><input required value={carForm.model} onChange={(e) => setCarForm({ ...carForm, model: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white transition-all text-sm sm:text-base" placeholder="Ex: 911 Turbo S" /></div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">{t("admin.fleet.price_day")}</label><input required type="number" value={carForm.pricePerDay} onChange={(e) => setCarForm({ ...carForm, pricePerDay: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-black text-base sm:text-xl" /></div>
                      <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.fuel")}</label><select value={carForm.fuel} onChange={(e) => setCarForm({...carForm, fuel: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base"><option>Essence</option><option>Diesel</option><option>Hybride</option><option>Électrique</option></select></div>
                    </div>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.media")}</label>
                      <div className="flex flex-col gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-8 sm:py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-[2.5rem] flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                          <Upload className="text-blue-500 group-hover:scale-110 transition-transform w-6 h-6 sm:w-8 sm:h-8" />
                          <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Importer des images</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {carForm.images.map((img, i) => (
                            <div key={i} className="relative h-16 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                              <img src={img} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeCarImage(i)} className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-white/90 text-red-500 rounded-md sm:rounded-lg shadow-xl hover:bg-red-500 hover:text-white transition-all"><X size={10} className="sm:w-3 sm:h-3" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Youtube size={12} className="text-red-500 sm:w-4 sm:h-4" /> {t("admin.fleet.video_link")}</label>
                      <input type="url" value={carForm.videoUrl} onChange={(e) => setCarForm({...carForm, videoUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white text-sm sm:text-base" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest ml-2 flex items-center gap-2"><ShieldCheck size={12} className="sm:w-4 sm:h-4" /> {t("admin.fleet.insurance")}</label><input type="date" value={carForm.insuranceExpiry} onChange={(e) => setCarForm({...carForm, insuranceExpiry: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" /></div>
                  <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2 flex items-center gap-2"><FileBadge size={12} className="sm:w-4 sm:h-4" /> {t("admin.fleet.tech_visit")}</label><input type="date" value={carForm.technicalVisitExpiry} onChange={(e) => setCarForm({...carForm, technicalVisitExpiry: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" /></div>
                  <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-green-500 uppercase tracking-widest ml-2 flex items-center gap-2"><DollarSign size={12} className="sm:w-4 sm:h-4" /> {t("admin.fleet.vignette")}</label><input type="date" value={carForm.vignetteExpiry} onChange={(e) => setCarForm({...carForm, vignetteExpiry: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.last_oil")}</label><input type="number" value={carForm.lastOilChangeKm} onChange={(e) => setCarForm({...carForm, lastOilChangeKm: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" /></div>
                  <div className="space-y-2"><label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.fleet.next_oil")}</label><input type="number" value={carForm.nextOilChangeKm} onChange={(e) => setCarForm({...carForm, nextOilChangeKm: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" /></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 sm:pt-12 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => setShowCarModal(false)} className="flex-1 py-4 sm:py-6 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-xl sm:rounded-[2rem] uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all order-2 sm:order-1">{t("common.cancel")}</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl sm:rounded-[2rem] shadow-2xl shadow-blue-500/40 uppercase text-[10px] tracking-widest hover:scale-[1.01] active:scale-95 transition-all order-1 sm:order-2">
                    {isSubmitting ? t("auth.processing") : (editingCarId ? t("common.save") : t("common.confirm"))}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPENSE MODAL */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExpenseModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden">
              <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-6 sm:px-12 py-6 sm:py-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3 sm:gap-4">
                  <Receipt size={20} className="text-red-500 sm:w-8 sm:h-8" /> {t("admin.expenses.add_btn")}
                </h2>
                <button onClick={() => setShowExpenseModal(false)} className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>

              <form onSubmit={handleExpenseSubmit} className="p-6 sm:p-12 space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.expenses.designation")}</label>
                  <input required value={expenseForm.title} onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white text-sm sm:text-base" placeholder="Ex: Vidange Porsche 911" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.expenses.amount")} ({agencySettings.currency})</label>
                    <input required type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-black text-base sm:text-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.expenses.category")}</label>
                    <select value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value as any})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base">
                      <option value="maintenance">Maintenance</option>
                      <option value="fuel">Carburant</option>
                      <option value="insurance">Assurance</option>
                      <option value="tax">Taxe / Vignette</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("common.date")}</label>
                    <input required type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{t("admin.expenses.vehicle")}</label>
                    <select value={expenseForm.carId} onChange={(e) => setExpenseForm({...expenseForm, carId: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold text-sm sm:text-base">
                      <option value="">{t("common.actions")}</option>
                      {cars.map(c => (
                        <option key={c._id} value={c._id}>{c.brand} {c.model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-8">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-4 sm:py-6 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-xl sm:rounded-[2rem] uppercase text-[10px] tracking-widest order-2 sm:order-1">{t("common.cancel")}</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 sm:py-6 bg-red-600 text-white font-black rounded-xl sm:rounded-[2rem] shadow-2xl shadow-red-500/40 uppercase text-[10px] tracking-widest hover:scale-[1.01] active:scale-95 transition-all order-1 sm:order-2">
                    {isSubmitting ? t("auth.processing") : t("common.save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SERVICE MODAL */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowServiceModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-6 sm:px-12 py-6 sm:py-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
                <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3 sm:gap-4">
                  <Zap size={20} className="text-blue-600 sm:w-8 sm:h-8" /> {editingServiceId ? "Modifier" : "Nouveau Service"}
                </h2>
                <button onClick={() => setShowServiceModal(false)} className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>

              <form onSubmit={handleServiceSubmit} className="p-6 sm:p-12 space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Titre</label>
                  <input required value={serviceForm.title} onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
                  <textarea required value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white h-24 sm:h-32 text-sm" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Couleur</label>
                    <select value={serviceForm.color} onChange={(e) => setServiceForm({...serviceForm, color: e.target.value as any})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white text-sm">
                      <option value="blue">Bleu</option>
                      <option value="emerald">Emeraude</option>
                      <option value="violet">Violet</option>
                      <option value="amber">Ambre</option>
                      <option value="pink">Rose</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Catégorie</label>
                    <select value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white text-sm">
                      <option value="tech">Technologie</option>
                      <option value="security">Sécurité</option>
                      <option value="service">Service Client</option>
                      <option value="logistics">Logistique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Statistique</label>
                    <input value={serviceForm.stats} onChange={(e) => setServiceForm({...serviceForm, stats: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 dark:text-white text-sm" placeholder="ex: 98%" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Label Stat</label>
                    <input value={serviceForm.statLabel} onChange={(e) => setServiceForm({...serviceForm, statLabel: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sm:rpy-3 sm:py-4 dark:text-white text-sm" placeholder="Satisfaction" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-8">
                  <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-4 sm:py-6 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-xl sm:rounded-[2rem] uppercase text-[10px] tracking-widest order-2 sm:order-1">ANNULER</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 sm:py-6 bg-blue-600 text-white font-black rounded-xl sm:rounded-[2rem] shadow-2xl shadow-blue-500/40 uppercase text-[10px] tracking-widest hover:scale-[1.01] active:scale-95 transition-all order-1 sm:order-2">
                    {isSubmitting ? "ENCOURS..." : "VALIDER"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignatureModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSignatureModal(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[3.5rem] shadow-3xl overflow-hidden border border-white/10">
              <div className="px-6 sm:px-12 py-6 sm:py-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3 sm:gap-4">
                    <FileBadge className="text-indigo-600 sm:w-8 sm:h-8" /> Signature
                  </h2>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Validation contrat</p>
                </div>
                <button onClick={() => setShowSignatureModal(false)} className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>

              <div className="p-4 sm:p-12 space-y-6 sm:space-y-8 text-center">
                <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl sm:rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
                  <p className="text-[10px] sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    Signez ci-dessous pour confirmer la location de : <span className="font-black underline">{currentBookingForSignature?.carInfo?.brand} {currentBookingForSignature?.carInfo?.model}</span>
                  </p>
                </div>

                <div className="relative inline-block w-full bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl border-2 sm:border-4 border-gray-100 dark:border-gray-800 overflow-hidden cursor-crosshair">
                  <canvas
                    ref={signaturePadRef}
                    width={window.innerWidth < 640 ? window.innerWidth - 60 : 500}
                    height={200}
                    className="touch-none w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2">
                  <button onClick={clearSignature} className="flex-1 py-3 sm:py-5 bg-gray-100 dark:bg-gray-900 text-gray-500 font-black rounded-xl sm:rounded-2xl uppercase text-[8px] sm:text-[10px] tracking-widest flex items-center justify-center gap-2">EFFACER</button>
                  <button onClick={saveSignatureAndGenerate} className="flex-[2] py-3 sm:py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl uppercase text-[8px] sm:text-[10px] tracking-widest flex items-center justify-center gap-2">VALIDER & GÉNÉRER</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInspectionModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInspectionModal(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl sm:rounded-[3.5rem] shadow-3xl overflow-hidden border border-white/10">
              <div className="px-6 sm:px-12 py-6 sm:py-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3 sm:gap-4">
                    <Camera className="text-blue-600 sm:w-8 sm:h-8" /> État des Lieux
                  </h2>
                  <p className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{inspectionType === 'check-in' ? 'Départ du véhicule' : 'Retour du véhicule'}</p>
                </div>
                <button onClick={() => setShowInspectionModal(false)} className="p-2 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-3xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>

              <div className="p-6 sm:p-12 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Photos du véhicule</label>
                  <div className="grid grid-cols-4 gap-4">
                    {inspectionForm.photos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <img src={p} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                      <Plus className="text-gray-300" />
                      <input type="file" multiple className="hidden" onChange={handleInspectionPhotoUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Notes & Observations</label>
                  <textarea 
                    value={inspectionForm.notes}
                    onChange={(e) => setInspectionForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 dark:text-white h-32 focus:ring-2 ring-blue-500 outline-none transition-all"
                    placeholder="Signalez les rayures, le niveau de carburant, etc..."
                  />
                </div>

                <button 
                  onClick={handleSaveInspection}
                  disabled={isSubmitting}
                  className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/30 uppercase text-[10px] tracking-widest hover:scale-[1.01] transition-all"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Valider l\'État des Lieux'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && latestNotification && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed bottom-10 right-10 z-[1000] flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-blue-500/20 shadow-2xl min-w-[320px]">
            <div className="p-3 bg-blue-600 rounded-2xl"><Zap className="text-white w-6 h-6 animate-pulse" /></div>
            <div className="flex-1"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Système Alert Live</p><p className="text-sm font-black dark:text-white leading-tight">{latestNotification}</p></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
