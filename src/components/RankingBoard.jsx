import { Trophy, ShieldCheck, ShieldAlert, AlertTriangle, Fingerprint, Activity } from 'lucide-react';

export const RankingBoard = ({ ranking }) => {
  return (
    <div className="w-full max-w-3xl mt-8 pb-12">
      <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3 font-mono border-b border-gray-800 pb-2">
        <Trophy className="w-6 h-6 text-yellow-500" /> LEADERBOARD
      </h2>
      
      <div className="space-y-6 font-mono">
        {ranking.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
            [+] Esperando competidores... Sube la primera contraseña.
          </div>
        ) : (
          ranking.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-5 rounded-lg flex flex-col gap-4 border-l-4 bg-gray-900 shadow-lg ${
                item.is_valid ? 'border-l-green-500 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'border-l-red-500'
              }`}
            >
              {/* Cabecera de la Tarjeta */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-gray-700 w-8">#{index + 1}</span>
                  <h3 className="text-xl font-bold text-gray-200">
                    {item.nickname} 
                    <span className="text-gray-500 text-sm font-normal ml-3 tracking-widest bg-gray-950 px-2 py-1 rounded">
                      {item.password}
                    </span>
                  </h3>
                </div>
                {index === 0 && item.is_valid && <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-md" />}
              </div>

              {/* Panel de Estadísticas (3 Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Porcentaje */}
                <div className="flex flex-col items-center justify-center p-3 bg-black border border-gray-800 rounded">
                  <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3"/> Seguridad Global
                  </span>
                  <span className={`text-3xl font-black ${item.is_valid ? 'text-green-400' : 'text-red-500'}`}>
                    {item.percentage}%
                  </span>
                </div>

                {/* 2. Filtraciones (HIBP) */}
                <div className="flex flex-col justify-center p-3 bg-black border border-gray-800 rounded">
                  <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3"/> Búsqueda en Internet
                  </span>
                  {item.is_valid ? (
                    <span className="text-sm font-bold text-green-400 flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-4 h-4" /> 0 Filtraciones (Limpia)
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-500 flex items-center gap-1 mt-1">
                      <ShieldAlert className="w-4 h-4 shrink-0" /> Comprometida {item.pwned_count?.toLocaleString() || 0} veces
                    </span>
                  )}
                </div>

                {/* 3. Complejidad (Zxcvbn) */}
                <div className="flex flex-col justify-center p-3 bg-black border border-gray-800 rounded">
                  <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3"/> Estructura (Zxcvbn)
                  </span>
                  <span className="text-sm font-bold text-blue-400 mt-1">
                    Nivel {item.score} de 4
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    {item.score < 2 ? 'Fácil de crackear' : item.score === 4 ? 'Inmune a fuerza bruta' : 'Resistencia media'}
                  </span>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};