import { Terminal } from 'lucide-react';

export const WelcomeScreen = ({ nickname, setNickname, onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 border border-green-500/30 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] w-full max-w-md mx-auto">
      <Terminal className="w-16 h-16 text-green-400 mb-4" />
      <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">INICIAR SESIÓN</h2>
      <p className="text-gray-400 text-sm mb-6 text-center">Ingresa tu alias de competidor para acceder al panel de evaluación de seguridad.</p>
      
      <input 
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Tu alias (Ej. Neo, Trinity...)"
        className="w-full bg-gray-950 border border-gray-700 text-green-400 px-4 py-3 rounded outline-none focus:border-green-500 font-mono mb-4 placeholder-gray-600"
      />
      
      <button 
        onClick={onStart}
        disabled={!nickname.trim()}
        className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-4 rounded font-mono uppercase tracking-wider disabled:opacity-50 transition-colors"
      >
        Ingresar al Sistema
      </button>
    </div>
  );
};