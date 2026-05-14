import { useEffect, useState } from "react";
import { agencyService } from "../services/api";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { 
  Building2, 
  Users, 
  Car, 
  TrendingUp, 
  Plus, 
  Activity, 
  ShieldCheck, 
  Globe,
  Settings,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [agencyData, statsData] = await Promise.all([
        agencyService.getAll(),
        agencyService.getStats()
      ]);
      setAgencies(agencyData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading superadmin data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <Header user={user} />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex items-center gap-6 mb-12">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] shadow-xl">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black dark:text-white">Super Admin Console</h1>
            <p className="text-gray-500 font-medium">Platform-wide Overview & Control</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Agencies", value: stats?.agencies || 0, icon: Building2, color: "text-blue-500" },
                { label: "Total Revenue", value: `${stats?.revenue || 0} DH`, icon: TrendingUp, color: "text-green-500" },
                { label: "Total Cars", value: stats?.cars || 0, icon: Car, color: "text-indigo-500" },
                { label: "Active Sessions", value: stats?.bookings || 0, icon: Activity, color: "text-purple-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                  <div className={`${s.color} mb-4`}><s.icon size={28} /></div>
                  <div className="text-3xl font-black dark:text-white">{s.value}</div>
                  <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Agency List */}
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                  <Globe className="text-indigo-600" /> Managed Agencies
                </h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                  <Plus size={20} /> ONBOARD NEW AGENCY
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Agency Name</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Contact Email</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {agencies.map((agency) => (
                      <tr key={agency._id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            {agency.logoUrl ? (
                              <img src={agency.logoUrl} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {agency.name?.[0]}
                              </div>
                            )}
                            <div className="font-black dark:text-white">{agency.name}</div>
                          </div>
                        </td>
                        <td className="px-10 py-6 font-medium text-gray-500">{agency.email}</td>
                        <td className="px-10 py-6">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                            <Settings size={18} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {agencies.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-bold uppercase text-xs">No agencies found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-[3rem] shadow-3xl overflow-hidden border border-white/10">
              <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Onboard New Agency</h2>
                <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Agency Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-6 py-4 dark:text-white font-bold" placeholder="AVENIR CAR EXCLUSIVE" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-6 py-4 dark:text-white font-bold" placeholder="admin@agency.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Temp Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-6 py-4 dark:text-white font-bold" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-6 py-4 dark:text-white font-bold" placeholder="Casablanca, Morocco" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                  {isSubmitting ? "PROCESSING..." : "CREATE AGENCY & ADMIN"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
