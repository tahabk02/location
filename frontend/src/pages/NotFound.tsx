import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-center text-slate-900">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-lg text-slate-600">Page introuvable.</p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-2xl bg-sky-600 px-6 py-3 text-white hover:bg-sky-500"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}
