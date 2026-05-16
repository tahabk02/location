import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { lazy, Suspense } from "react";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.warn("VITE_STRIPE_PUBLISHABLE_KEY is missing. Stripe functionality will be disabled.");
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Lazy loading components
const HomePage = lazy(() => import("./pages/Home").then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("./pages/Login").then(m => ({ default: m.LoginPage })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const CarCatalog = lazy(() => import("./pages/CarCatalog"));
const CarDetails = lazy(() => import("./components/CarDetails").then(m => ({ default: m.CarDetails })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-sm font-black uppercase tracking-widest animate-pulse">Chargement...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: JSX.Element; role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <Elements stripe={stripePromise}>
              <AppContent />
            </Elements>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

const AppContent = () => {
  return (
    <div className="relative">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cars" element={<CarCatalog />} />
          <Route path="/car/:id" element={<CarDetails />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/superadmin" 
            element={
              <ProtectedRoute role="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/client" 
            element={
              <ProtectedRoute role="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <FloatingWhatsApp />
    </div>
  );
};

export default App;
