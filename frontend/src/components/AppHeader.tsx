import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold">
          LocationPro
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-sky-300">
            Accueil
          </Link>
          <Link to="/cars" className="hover:text-sky-300">
            Véhicules
          </Link>
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" className="hover:text-sky-300">
                  Admin
                </Link>
              ) : (
                <Link to="/client" className="hover:text-sky-300">
                  Client
                </Link>
              )}
              <button
                onClick={logout}
                className="rounded bg-sky-500 px-3 py-1 text-white hover:bg-sky-400"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded border border-white px-3 py-1 hover:bg-white hover:text-slate-900"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
