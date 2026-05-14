import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import CarCatalog from "./pages/CarCatalog";
import { CarDetails } from "./components/CarDetails";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: JSX.Element; role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Chargement...</div>;
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
            <div className="relative">
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
              <FloatingWhatsApp />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
