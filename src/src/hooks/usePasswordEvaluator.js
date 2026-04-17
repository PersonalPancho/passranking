import { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { checkPasswordBreach } from '../services/hibp';
import { supabase } from '../../lib/supabase'; // Asegúrate de que la ruta sea correcta

export const usePasswordEvaluator = (onSuccess) => {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [crackTime, setCrackTime] = useState(''); // Nuevo estado
  const [guesses, setGuesses] = useState(0); // Nuevo estado
  const [isChecking, setIsChecking] = useState(false);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    
    // Obtenemos TODO el análisis de zxcvbn, no solo el score
    const evaluation = zxcvbn(val);
    setScore(evaluation.score);
    // Extraemos el tiempo estimado para un ataque de fuerza bruta offline
    setCrackTime(evaluation.crack_times_display.offline_slow_hashing_1e4_per_second);
    // Extraemos el número de intentos matemáticos
    setGuesses(evaluation.guesses);
  };

  const evaluateAndSubmit = async (nickname) => {
    if (!password) return;

    setIsChecking(true);
    const pwnedCount = await checkPasswordBreach(password);
    const isValid = pwnedCount === 0;
    
    let securityPercentage = 0;
    if (!isValid) {
      securityPercentage = 0; 
    } else {
      const percentageMap = [10, 25, 50, 75, 100];
      securityPercentage = percentageMap[score];
    }
    
    // Insertar en Supabase incluyendo los nuevos datos
    const { error } = await supabase
      .from('ranking')
      .insert([
        {
          nickname: nickname,
          password: password,
          score: score,
          pwned_count: pwnedCount,
          is_valid: isValid,
          percentage: securityPercentage,
          crack_time: crackTime, // Guardamos el texto (ej. "centuries")
          guesses: guesses       // Guardamos el número exacto
        }
      ]);

    if (error) {
      console.error("Error guardando en Supabase:", error);
    } else {
      if (onSuccess) onSuccess();
    }

    setIsChecking(false);
    setPassword('');
    setScore(0);
    setCrackTime('');
  };

  return { password, score, isChecking, handlePasswordChange, evaluateAndSubmit };
};