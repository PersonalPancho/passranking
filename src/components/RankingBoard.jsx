import { useState } from 'react'; // <-- AÑADIDO: Importamos useState
import { Trophy, ShieldCheck, ShieldAlert, AlertTriangle, Fingerprint, Activity, User, Trash2 } from 'lucide-react';

export const RankingBoard = ({ ranking, currentUser, isAdmin, onDelete }) => {
  // NUEVO ESTADO: Controla qué contraseña está expandida
  const [expandedId, setExpandedId] = useState(null);
  
  const formatGuesses = (num) => {
    if (num === undefined || num === null) return "0";
    const n = Number(num);
    if (n > 1000000000) return n.toExponential(2); 
    return n.toLocaleString();
  };

  const formatCrackTime = (time) => {
    if (!time) return 'Desconocido';
    return time
      .replace('centuries', 'siglos')
      .replace('years', 'años')
      .replace('months', 'meses')
      .replace('days', 'días')
      .replace('hours', 'horas')
      .replace('minutes', 'minutos')
      .replace('seconds', 'segundos')
      .replace('less than a second', 'Instantáneo');
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const top5 = ranking.slice(0, 5);
  const displayList = isAdmin ? ranking : top5; 

  const currentUserIndex = ranking.findIndex(item => item.nickname === currentUser);
  const currentUserEntry = currentUserIndex !== -1 ? ranking[currentUserIndex] : null;
  const showCurrentUserExtra = !isAdmin && currentUserEntry && currentUserIndex >= 5;

  const renderCard = (item, actualIndex, isHighlight = false) => {
    const isExpanded = expandedId === item.id;

    return (
      <div 
        key={item.id + (isHighlight ? '-highlight' : '')} 
        className={`p-5 rounded-lg flex flex-col gap-4 border-l-4 bg-gray-900 shadow-lg transition-all ${
          item.is_valid ? 'border-l-green-500 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'border-l-red-500'
        } ${isHighlight ? 'border-2 border-blue-500 bg-blue-900/10 scale-[1.02]' : ''}`}
      >
        {/* CABECERA RESPONSIVE */}
        <div className="flex justify-between items-start sm:items-center border-b border-gray-800 pb-3 gap-2">
          
          {/* Contenedor Izquierdo (Número, Alias y Contraseña) */}
          {/* min-w-0 y flex-1 son vitales para evitar que el contenedor rompa la pantalla */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl font-black text-gray-700 w-8 shrink-0 mt-1 sm:mt-0">
              #{actualIndex + 1}
            </span>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2 shrink-0">
                <span className="truncate">{item.nickname}</span> 
                {item.nickname === currentUser && <User className="w-5 h-5 text-blue-400 shrink-0" />}
              </h3>
              
              {/* LA CONTRASEÑA: Se trunca por defecto, se expande al hacer clic */}
              <span 
                onClick={() => toggleExpand(item.id)}
                className={`text-gray-500 text-sm font-normal tracking-widest bg-gray-950 px-2 py-1 rounded cursor-pointer border border-gray-800/30 hover:border-gray-600 transition-all ${
                  isExpanded ? 'break-all whitespace-normal' : 'truncate'
                }`}
                title={isExpanded ? "Toca para ocultar" : "Toca para ver completa"}
              >
                {item.password}
              </span>
            </div>
          </div>
          
          {/* Zona de Iconos / Botones (Derecha) */}
          <div className="flex items-center gap-3 shrink-0 mt-1 sm:mt-0">
            {actualIndex === 0 && item.is_valid && !isAdmin && <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-md" />}
            
            {isAdmin && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 bg-black border border-gray-800 rounded-md text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
                title={`Eliminar contraseña de ${item.nickname}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ESTADÍSTICAS (Mantenido igual) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-black border border-gray-800 rounded">
            <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3"/> Seguridad Global
            </span>
            <span className={`text-3xl font-black ${item.is_valid ? 'text-green-400' : 'text-red-500'}`}>
              {item.percentage}%
            </span>
          </div>

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

          <div className="flex flex-col justify-center p-3 bg-black border border-gray-800 rounded">
            <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Fingerprint className="w-3 h-3"/> Resistencia Bruta
            </span>
            <span className="text-sm font-bold text-blue-400 mt-1">
              Nivel {item.score} de 4
            </span>
            <span className="text-[11px] text-yellow-500 mt-1 font-bold">
              Intentos: {formatGuesses(item.guesses)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              T. Crackeo: {formatCrackTime(item.crack_time)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mt-8 pb-12">
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 font-mono border-b border-gray-800 pb-2 ${isAdmin ? 'text-red-500' : 'text-green-400'}`}>
        {isAdmin ? <ShieldAlert className="w-6 h-6 text-red-500" /> : <Trophy className="w-6 h-6 text-yellow-500" />}
        {isAdmin ? 'PANEL DE ADMINISTRACIÓN (TODA LA BDD)' : 'LEADERBOARD TOP 5'}
      </h2>
      
      <div className="space-y-6 font-mono">
        {ranking.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500">
            [+] Esperando competidores... Sube la primera contraseña.
          </div>
        ) : (
          <>
            {displayList.map((item, index) => renderCard(item, index))}
            
            {showCurrentUserExtra && (
              <>
                <div className="flex flex-col items-center justify-center py-4 gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                </div>
                <h3 className="text-center text-blue-400 text-sm font-bold tracking-widest mt-2 mb-4">TU POSICIÓN ACTUAL</h3>
                {renderCard(currentUserEntry, currentUserIndex, true)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};