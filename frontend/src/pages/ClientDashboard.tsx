import { useEffect, useState } from "react";
import { createBooking, getCars, getMyBookings } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Car, Reservation } from "../types";
import { Header } from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car as CarIcon,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  X,
  FileText,
  Download,
  Printer,
  MapPin,
  CreditCard,
  User,
  Zap,
  MessageCircle,
} from "lucide-react";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation Modal
  const [showResModal, setShowResModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // Payment Simulation
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const handleStartPayment = (res: any) => {
    setActiveReceipt(res);
    setShowPaymentModal(true);
    setPaymentStatus("idle");
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReceipt) return;
    
    setPaymentStatus("processing");
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Update status in backend
      await bookingService.updateStatus(activeReceipt._id, "paid");
      
      setPaymentStatus("success");
      setTimeout(() => {
        setShowPaymentModal(false);
        loadData();
      }, 2000);
    } catch (err) {
      alert("Erreur lors du paiement");
      setPaymentStatus("idle");
    }
  };

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const [carData, resData] = await Promise.all([
        getCars(),
        getMyBookings(),
      ]);
      setCars(carData.filter((c) => c.available));
      setReservations(resData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenReserve = (car: Car) => {
    setSelectedCar(car);
    setShowResModal(true);
  };

  const handleOpenReceipt = (res: any) => {
    setActiveReceipt(res);
    setShowReceiptModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Basic simulation of download by printing to PDF or alerting
    window.print();
  };

  const handleShareWhatsApp = (res: any) => {
    const message =
      `*REÇU DE RÉSERVATION - AVENIR KAMIL CAR PREMIUM*\n\n` +
      `🧾 *Facture N°:* ${res.invoiceNumber}\n` +
      `🚗 *Véhicule:* ${res.carInfo?.brand} ${res.carInfo?.model}\n` +
      `📅 *Dates:* Du ${res.startDate} au ${res.endDate}\n` +
      `💰 *Total Payé:* ${res.totalAmount} DH\n\n` +
      `Merci de votre confiance !`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        carId: selectedCar._id,
        startDate,
        endDate,
      });

      // WhatsApp Integration
      const message =
        `Bonjour AVENIR KAMIL CAR, je souhaite confirmer ma réservation :\n\n` +
        `🚗 Véhicule : ${selectedCar.brand} ${selectedCar.model}\n` +
        `📅 Période : du ${startDate} au ${endDate}\n` +
        `👤 Client : ${user?.name}\n` +
        `🧾 N° Facture : ${res.invoiceNumber}`;

      const whatsappUrl = `https://wa.me/212600000000?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");
      setShowResModal(false);
      loadData();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la réservation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <Header user={user} />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black dark:text-white mb-2 uppercase tracking-tighter">
              Bonjour, {user?.name}
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium uppercase tracking-wide">
              Prêt pour votre prochaine expérience AVENIR KAMIL CAR ?
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronisation Live...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            {/* Fleet Section */}
            <div className="lg:col-span-2 space-y-6 md:space-y-10">
              <section>
                <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                  <CarIcon className="text-blue-600" /> Collection Disponible
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {cars.slice(0, 4).map((car) => (
                    <div
                      key={car._id}
                      className="bg-white dark:bg-gray-900 rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl group"
                    >
                      <div className="h-48 md:h-56 relative overflow-hidden">
                        <img
                          src={car.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[8px] md:text-[10px] font-black tracking-widest uppercase">
                          {car.category}
                        </div>
                      </div>
                      <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg md:text-xl font-black dark:text-white uppercase tracking-tight">
                              {car.brand}
                            </h3>
                            <p className="text-blue-600 font-bold text-xs md:text-sm uppercase tracking-wide">
                              {car.model}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl md:text-2xl font-black dark:text-white">
                              {car.pricePerDay} DH
                            </p>
                            <span className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest block">
                              / jour
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenReserve(car)}
                          className="w-full py-4 bg-gray-950 dark:bg-blue-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                        >
                          RÉSERVER <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* History Sidebar */}
            <div className="space-y-6 md:space-y-8">
              <section className="bg-white dark:bg-gray-900 rounded-3xl md:rounded-[3rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Clock className="text-purple-500" /> Mes Réservations
                </h2>
                <div className="space-y-4">
                  {reservations.length > 0 ? (
                    reservations.map((res) => (
                      <div
                        key={res._id}
                        className="p-4 md:p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-3xl border border-transparent hover:border-blue-500/20 transition-all group shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-black dark:text-white text-xs md:text-sm uppercase tracking-tight">
                            {res.carInfo?.brand} {res.carInfo?.model}
                          </p>
                          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-lg ${
                            res.status === "paid" 
                              ? "bg-blue-500/10 text-blue-500" 
                              : res.status === "confirmed"
                                ? "bg-green-500/10 text-green-500"
                                : res.status === "pending"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-gray-500/10 text-gray-500"
                          }`}>
                            {res.status === "paid" ? "Payé" : (res.status === "confirmed" ? "Confirmé" : (res.status === "pending" ? "En attente" : res.status))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-4">
                          <Calendar size={12} className="text-blue-500" /> {res.startDate} → {res.endDate}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            {res.status === "confirmed" && (
                              <button
                                onClick={() => handleStartPayment(res)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                              >
                                <CreditCard size={12} /> Payer
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenReceipt(res)}
                              className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-600"
                              title="Voir le reçu"
                            >
                              <FileText
                                size={16}
                                className="text-gray-600 dark:text-gray-300"
                              />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-600 font-black text-sm">
                              {res.totalAmount} DH
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                              #{res.invoiceNumber?.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 md:py-20">
                      <Shield className="w-10 h-10 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                        Aucune location
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showResModal && selectedCar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl md:rounded-[3rem] overflow-hidden shadow-3xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tighter">
                    Confirmation
                  </h2>
                  <button
                    onClick={() => setShowResModal(false)}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl md:rounded-3xl mb-6 md:mb-8">
                  <img
                    src={selectedCar.image}
                    className="w-20 md:w-24 h-14 md:h-16 object-cover rounded-xl shadow-lg"
                  />
                  <div>
                    <p className="font-black dark:text-white uppercase tracking-tight text-sm md:text-base">
                      {selectedCar.brand} {selectedCar.model}
                    </p>
                    <p className="text-blue-600 font-black text-sm">
                      {selectedCar.pricePerDay} DH{" "}
                      <span className="text-[10px] text-gray-500 font-bold uppercase">/ jour</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleConfirmReservation} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Début
                      </label>
                      <input
                        required
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Fin
                      </label>
                      <input
                        required
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 md:p-6 bg-green-500/10 rounded-2xl md:rounded-3xl border border-green-500/20 flex gap-4">
                    <MessageSquare className="text-green-600 shrink-0" size={20} />
                    <p className="text-[10px] md:text-xs font-bold text-green-700 dark:text-green-400 uppercase leading-relaxed">
                      Après confirmation, vous serez redirigé vers WhatsApp pour
                      finaliser avec l'agence.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl md:rounded-3xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all uppercase text-xs tracking-widest"
                  >
                    {isSubmitting
                      ? "Traitement..."
                      : "CONFIRMER & WHATSAPP"}
                    <ArrowRight size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && activeReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl md:rounded-[3rem] overflow-hidden shadow-3xl print:shadow-none print:rounded-none max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div id="receipt-content" className="p-6 md:p-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-2 uppercase tracking-tighter">
                      Avenir Kamil Car
                    </h2>
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                      Reçu & Facturation Officielle
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl sm:bg-transparent">
                    <p className="text-xs md:text-sm font-black dark:text-white uppercase">
                      REF: #{activeReceipt.invoiceNumber?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {new Date(activeReceipt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Client
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-blue-500" />
                      <p className="text-xs md:text-sm font-bold dark:text-white uppercase">
                        {user?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-blue-500" />
                      <p className="text-xs md:text-sm font-medium dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Agence
                    </p>
                    <p className="text-xs md:text-sm font-bold dark:text-white mb-1 uppercase">
                      AVENIR KAMIL CAR CASABLANCA
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">
                      22, Boulevard de la Résistance, Casablanca, Maroc
                    </p>
                  </div>
                </div>

                {/* Details Table */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-[2rem] p-6 md:p-8 mb-8 md:mb-12 border border-gray-100 dark:border-gray-800 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center sm:text-left">
                    Détails de la Location
                  </p>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                          <CarIcon size={24} />
                        </div>
                        <div>
                          <p className="font-black dark:text-white uppercase tracking-tight">
                            {activeReceipt.carInfo?.brand}{" "}
                            {activeReceipt.carInfo?.model}
                          </p>
                          <p className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                            Véhicule Premium
                          </p>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="font-black dark:text-white text-lg">
                          {activeReceipt.carInfo?.pricePerDay} DH
                        </p>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">/ jour</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-blue-500" />
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Début
                          </p>
                          <p className="text-xs font-bold dark:text-white">
                            {activeReceipt.startDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-blue-500" />
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Fin
                          </p>
                          <p className="text-xs font-bold dark:text-white">
                            {activeReceipt.endDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 text-green-500">
                      <CheckCircle size={16} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Paiement Validé
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium max-w-[200px] uppercase tracking-tighter">
                      Ce document sert de reçu officiel certifié par Avenir Kamil Car.
                    </p>
                  </div>
                  <div className="text-center sm:text-right p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 w-full sm:w-auto">
                    <p className="text-[8px] font-black text-white/70 uppercase tracking-[0.3em] mb-1">
                      Total Payé TTC
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                      {activeReceipt.totalAmount} <span className="text-xl">DH</span>
                    </p>
                  </div>
                </div>

                {/* Footer Buttons (Hidden on Print) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="py-4 bg-gray-900 dark:bg-gray-800 text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all text-[10px] tracking-widest uppercase"
                  >
                    <Printer size={18} /> IMPRIMER
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-[10px] tracking-widest uppercase"
                  >
                    <Download size={18} /> PDF
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(activeReceipt)}
                    className="py-4 bg-green-600 text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 text-[10px] tracking-widest uppercase"
                  >
                    <MessageCircle size={18} /> WHATSAPP
                  </button>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white font-black rounded-xl md:rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-[10px] tracking-widest uppercase"
                  >
                    FERMER
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && activeReceipt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[3.5rem] border border-white/20 shadow-3xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl">
                      <CreditCard className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black dark:text-white">Paiement Sécurisé</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stripe Gateway Simulation</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X />
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-8 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase">Total à payer</span>
                    <span className="text-2xl font-black text-blue-600">{activeReceipt.totalAmount} DH</span>
                  </div>
                </div>

                {paymentStep === "idle" ? (
                  <form onSubmit={handleSimulatePayment} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Numéro de Carte</label>
                      <div className="relative">
                        <input
                          required
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                          <div className="w-8 h-5 bg-gray-200 rounded" />
                          <div className="w-8 h-5 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Expiration</label>
                        <input
                          required
                          placeholder="MM/YY"
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">CVC</label>
                        <input
                          required
                          placeholder="123"
                          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={cardInfo.cvc}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all mt-6"
                    >
                      PAYER MAINTENANT <Zap size={18} />
                    </button>
                  </form>
                ) : paymentStep === "processing" ? (
                  <div className="py-20 flex flex-col items-center text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
                    <h3 className="text-xl font-black dark:text-white">Traitement du paiement...</h3>
                    <p className="text-gray-500 mt-2">Veuillez ne pas fermer cette fenêtre.</p>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="text-green-500 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black dark:text-white">Paiement Réussi !</h3>
                    <p className="text-gray-500 mt-2">Votre réservation est maintenant confirmée.</p>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-4">Redirection...</p>
                  </div>
                )}
                
                <div className="mt-8 flex items-center justify-center gap-2 grayscale opacity-50">
                  <Shield size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sécurisé par LuxePay 256-bit</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #receipt-content, #receipt-content * {
              visibility: visible !important;
            }
            #receipt-content {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              padding: 40px !important;
              margin: 0 !important;
              background: white !important;
              color: black !important;
              z-index: 9999 !important;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
