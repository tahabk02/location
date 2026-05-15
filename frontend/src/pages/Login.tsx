import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Lock, Mail, ArrowRight, Car, UserPlus, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { register as registerApi, authService } from "../services/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code & New Pass
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ type: "", message: "" });
const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setForgotStatus({ type: "", message: "" });
  setIsSubmitting(true);
  try {
    const res = await authService.forgotPassword(forgotEmail.trim());
    setForgotStatus({ type: "success", message: res.message });
    setResetStep(2);
  } catch (err: any) {
    setForgotStatus({ type: "error", message: err.message });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus({ type: "", message: "" });
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ email: forgotEmail.trim(), code: resetCode, newPassword });
      setForgotStatus({ type: "success", message: "Mot de passe réinitialisé ! Connectez-vous." });
      setTimeout(() => {
        setShowForgotModal(false);
        setResetStep(1);
        setIsLogin(true);
      }, 2000);
    } catch (err: any) {
      setForgotStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser.role === "admin") navigate("/admin");
        else navigate("/client");
      } else {
        await registerApi({ name, email, password });
        setIsLogin(true);
        setError(t("auth.account_created"));
      }
    } catch (err) {
      setError(isLogin ? t("auth.invalid_creds") : t("auth.register_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40 z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 z-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-30"
      >
        <div className="bg-gray-900/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-1.5 mb-6 shadow-2xl shadow-blue-500/20 border border-white/20"
            >
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                {isLogin ? "Bienvenue" : "Nous Rejoindre"}
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                {isLogin ? "Luxe Drive Experience" : "Créez votre accès VIP"}
              </p>
            </motion.div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${isLogin ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
            >
              Connexion
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${!isLogin ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
            >
              Inscription
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest text-center border ${error === t("auth.account_created") ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                      placeholder="M. Ahmed Alami"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Adresse Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                  placeholder="contact@luxedrive.ma"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mot de Passe</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4.5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 mt-6 text-xs uppercase tracking-[0.2em]"
            >
              {isSubmitting ? "Traitement..." : (isLogin ? "Accéder au Club" : "Devenir Membre")} 
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-6 opacity-40">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 grayscale brightness-200" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 grayscale brightness-200" alt="Mastercard" />
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-[8px] font-black text-white uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              AES-256
            </div>
          </div>
        </div>
      </motion.div>

      {/* Styles for video animation */}
      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite ease-in-out;
        }
      `}</style>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-gray-900 border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Récupération</h3>
              <p className="text-gray-400 text-sm mb-8">
                {resetStep === 1 
                  ? "Entrez votre email pour recevoir un code de réinitialisation." 
                  : "Entrez le code reçu et votre nouveau mot de passe."}
              </p>

              {forgotStatus.message && (
                <div className={`p-4 rounded-xl mb-6 text-xs font-bold border ${forgotStatus.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                  {forgotStatus.message}
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 group-focus-within:text-blue-500" />
                      <input 
                        type="email" 
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    Envoyer le code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Code de validation</label>
                    <input 
                      type="text" 
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center tracking-[0.5em] font-black text-xl"
                      placeholder="000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Nouveau mot de passe</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 group-focus-within:text-blue-500" />
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                  >
                    Mettre à jour
                  </button>
                </form>
              )}
              
              <button 
                onClick={() => { setShowForgotModal(false); setResetStep(1); }}
                className="w-full mt-4 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
