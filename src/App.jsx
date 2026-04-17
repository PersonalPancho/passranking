import { useState, useEffect } from 'react';
import { usePasswordEvaluator } from './src/hooks/usePasswordEvaluator';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RankingBoard } from './components/RankingBoard';
import { Loader2, KeyRound, LogOut, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [nickname, setNickname] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [ranking, setRanking] = useState([]);

  // Función para descargar y ordenar el ranking
  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from('ranking')
      .select('*');
      
    if (data) {
      // Aplicamos la misma lógica de ordenamiento que tenías
      const sortedRanking = data.sort((a, b) => {
        if (a.is_valid === b.is_valid) return b.score - a.score;
        return a.is_valid ? -1 : 1;
      });
      setRanking(sortedRanking);
    }
  };

  // Leer Supabase al inicio y suscribirse a cambios en tiempo real
  useEffect(() => {
    fetchRanking();

    // Escuchar cualquier INSERT en la tabla 'ranking'
    const channel = supabase
      .channel('realtime-ranking')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'ranking' }, 
          () => {
            fetchRanking(); // Recargar datos cuando alguien sube un password
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { 
    password, 
    score, 
    isChecking, 
    handlePasswordChange, 
    evaluateAndSubmit 
  } = usePasswordEvaluator(() => {
    // Ya no hacemos push manual al estado, el listener en tiempo real lo hará
  });

  const handleStart = () => {
    if (nickname.trim()) setIsLogged(true);
  };

  // Función actualizada para limpiar la base de datos de Supabase

  // Función actualizada para limpiar la base de datos de Supabase con manejo de errores
  const handleClearRanking = async () => {
    if (window.confirm("⚠️ ¿Estás seguro de borrar toda la base de datos del ranking?")) {
      const { error } = await supabase
        .from('ranking')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Borra todo
      
      if (error) {
        console.error("Error borrando datos:", error);
        alert("Hubo un error al borrar la base de datos: " + error.message);
      } else {
        setRanking([]);
        alert("✅ Base de datos limpiada con éxito.");
      }
    }
  };

  const scoreColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 md:p-12 selection:bg-green-500 selection:text-black">
      
      {!isLogged ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <WelcomeScreen nickname={nickname} setNickname={setNickname} onStart={handleStart} />
          {ranking.length > 0 && <RankingBoard ranking={ranking} />}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          <div className="w-full flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-lg mb-8 shadow-md">
            <div className="font-mono">
              <span className="text-gray-500">Usuario: </span>
              <span className="text-green-400 font-bold">{nickname}</span>
            </div>
            <div className="flex gap-4">
              {/* Botón para reiniciar la base de datos (Solo visible para pancho0406) */}
              {nickname === 'pancho0406' && (
                <button 
                  onClick={handleClearRanking}
                  className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-sm transition-colors"
                  title="Borrar todos los datos"
                >
                  <Trash2 className="w-4 h-4" /> Reset DB
                </button>
              )}
              
              <button 
                onClick={() => setIsLogged(false)}
                className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-sm transition-colors border-l border-gray-700 pl-4"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>

          <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-green-500 to-emerald-400"></div>
            
            <h2 className="text-xl font-mono text-gray-300 mb-6 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-400" />
              EVALUAR NUEVA CONTRASEÑA
            </h2>

            <div className="space-y-6">
              <input 
                type="text"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Ingresa un password..."
                className="w-full bg-black border border-gray-700 focus:border-blue-500 text-white px-4 py-3 rounded-lg outline-none transition-all font-mono"
              />

              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>Nivel de Entropía</span>
                    <span className={scoreColors[score].replace('bg-', 'text-')}>LVL {score}/4</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${scoreColors[score]}`} 
                      style={{ width: `${(score + 1) * 20}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => evaluateAndSubmit(nickname)}
                disabled={isChecking || password.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all font-mono shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                {isChecking ? (
                  <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> EJECUTANDO AUDITORÍA...</>
                ) : (
                  'EJECUTAR AUDITORÍA'
                )}
              </button>
            </div>
          </div>

          <RankingBoard ranking={ranking} />
        </div>
      )}
    </div>
  );
}

export default App;