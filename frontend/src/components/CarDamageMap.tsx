import React, { useState } from 'react';
import { MapPin, X, Camera, Save, AlertCircle } from 'lucide-react';

interface DamagePoint {
  id: string;
  x: number;
  y: number;
  part: string;
  severity: 'light' | 'medium' | 'heavy';
  description: string;
  photo?: string;
}

interface CarDamageMapProps {
  onSave: (damages: DamagePoint[]) => void;
  onCancel: () => void;
  initialDamages?: DamagePoint[];
}

export const CarDamageMap: React.FC<CarDamageMapProps> = ({ onSave, onCancel, initialDamages = [] }) => {
  const [damages, setDamages] = useState<DamagePoint[]>(initialDamages);
  const [selectedPoint, setSelectedPoint] = useState<Partial<DamagePoint> | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSelectedPoint({ id: Date.now().toString(), x, y, severity: 'light', part: 'Carrosserie', description: '' });
  };

  const addDamage = () => {
    if (selectedPoint && selectedPoint.description) {
      setDamages([...damages, selectedPoint as DamagePoint]);
      setSelectedPoint(null);
    }
  };

  const removeDamage = (id: string) => {
    setDamages(damages.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl overflow-hidden shadow-3xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: Car Silhouette */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden flex flex-col items-center justify-center">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-8 self-start">État des Lieux Interactif</h3>
          
          <div 
            className="relative w-full aspect-[2/1] bg-contain bg-center bg-no-repeat cursor-crosshair"
            style={{ backgroundImage: 'url("https://www.carbodydesign.com/archive/2009/05/06-renault-megane-coupe-design-process/Renault-Megane-Coupe-Design-Sketches-5-lg.jpg")', opacity: 0.6 }}
            onClick={handleCanvasClick}
          >
            {/* Damage Markers */}
            {damages.map(d => (
              <div 
                key={d.id}
                className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-lg animate-pulse ${
                  d.severity === 'heavy' ? 'bg-red-500' : d.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                onClick={(e) => { e.stopPropagation(); removeDamage(d.id); }}
              />
            ))}

            {/* Current Selection Marker */}
            {selectedPoint && (
              <div 
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center"
                style={{ left: `${selectedPoint.x}%`, top: `${selectedPoint.y}%` }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Léger</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> Moyen</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Grave</div>
            <p className="ml-4 italic italic">Cliquer sur le schéma pour marquer un dégât</p>
          </div>
        </div>

        {/* Right: Damage Details */}
        <div className="w-full md:w-80 border-l border-gray-100 dark:border-gray-800 p-6 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
          {selectedPoint ? (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <h4 className="font-black dark:text-white uppercase text-sm flex items-center gap-2">
                <AlertCircle className="text-blue-600 w-4 h-4" /> Détails du Dégât
              </h4>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Sévérité</label>
                <div className="flex gap-2">
                  {['light', 'medium', 'heavy'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setSelectedPoint({...selectedPoint, severity: s as any})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                        selectedPoint.severity === s 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-500'
                      }`}
                    >
                      {s === 'light' ? 'Léger' : s === 'medium' ? 'Moyen' : 'Grave'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Description</label>
                <textarea 
                  value={selectedPoint.description}
                  onChange={(e) => setSelectedPoint({...selectedPoint, description: e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  placeholder="Ex: Rayure profonde porte avant droite..."
                />
              </div>

              <button 
                onClick={addDamage}
                disabled={!selectedPoint.description}
                className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
              >
                Ajouter le point
              </button>
              <button 
                onClick={() => setSelectedPoint(null)}
                className="w-full py-2 text-gray-500 font-bold text-[10px] uppercase"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <h4 className="font-black dark:text-white uppercase text-sm mb-4">Points relevés ({damages.length})</h4>
              
              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar mb-6">
                {damages.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400 font-medium">Aucun dégât marqué.<br/>Cliquer sur le véhicule.</p>
                  </div>
                ) : (
                  damages.map(d => (
                    <div key={d.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-start group">
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-600">{d.severity} • {d.part}</p>
                        <p className="text-xs font-medium dark:text-gray-300 line-clamp-2">{d.description}</p>
                      </div>
                      <button onClick={() => removeDamage(d.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => onSave(damages)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Enregistrer l'état
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase hover:text-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
