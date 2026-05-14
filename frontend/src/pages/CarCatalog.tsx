import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCars } from "../services/api";
import type { Car } from "../types";
import { Header } from "../components/Header";
import { Fuel, Users, Gauge, ChevronRight } from "lucide-react";

export default function CarCatalog() {
  const [cars, setCars] = useState<Car[]>([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    async function fetchCars() {
      try {
        const result = await getCars();
        setCars(result);
      } catch (err) {
        console.error("Error fetching cars:", err);
      }
    }
    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <Header user={user} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-slate-900 dark:text-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Notre Collection Premium
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-gray-400 max-w-2xl">
              Découvrez notre sélection exclusive de véhicules de luxe pour une
              expérience de conduite inégalée.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <article
              key={car._id}
              onClick={() => navigate(`/car/${car._id}`)}
              className="group cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl text-[10px] font-black tracking-widest uppercase">
                    {car.category || "Premium"}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                      {car.brand}
                    </h3>
                    <p className="text-blue-500 font-bold">{car.model}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {car.pricePerDay} DH
                    </span>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      / jour
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8">
                  <div className="text-center">
                    <Fuel className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <div className="text-[9px] font-black text-gray-400 uppercase">
                      Energie
                    </div>
                    <div className="text-[10px] font-bold dark:text-white uppercase truncate">
                      {car.fuel}
                    </div>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <div className="text-[9px] font-black text-gray-400 uppercase">
                      Places
                    </div>
                    <div className="text-[10px] font-bold dark:text-white">
                      {car.seats}
                    </div>
                  </div>
                  <div className="text-center">
                    <Gauge className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <div className="text-[9px] font-black text-gray-400 uppercase">
                      Vitesse
                    </div>
                    <div className="text-[10px] font-bold dark:text-white truncate">
                      {car.speed}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={car.available === false}
                  className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    car.available !== false 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:scale-105" 
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {car.available !== false ? "RÉSERVER MAINTENANT" : "DÉJÀ RÉSERVÉ"}
                  <ChevronRight size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
