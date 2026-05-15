import { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { checkPasswordBreach } from '../services/hibp';
import { supabase } from '../../lib/supabase'; 
import { isProfane } from '../utils/profanity';

const MAX_SUBMISSIONS_PER_DEVICE = 5; 
const COOLDOWN_SECONDS = 15;           

export const usePasswordEvaluator = (onSuccess) => {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [crackTime, setCrackTime] = useState('');
  const [guesses, setGuesses] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    
    const evaluation = zxcvbn(val);
    setScore(evaluation.score);
    setCrackTime(evaluation.crack_times_display.offline_slow_hashing_1e4_per_second);
    setGuesses(evaluation.guesses);
  };

  const evaluateAndSubmit = async (nickname) => {
    if (!password) return;

    const isAdmin = nickname === 'pancho0406';

    // --- 1. VERIFICACIÓN DE LÍMITES POR EQUIPO (LOCALSTORAGE) ---
    if (!isAdmin) {
      const pastSubmissions = parseInt(localStorage.getItem('pwd_submissions') || '0', 10);
      const lastSubmitTime = parseInt(localStorage.getItem('pwd_last_submit') || '0', 10);
      const now = Date.now();

      // Si alcanzó el límite de contraseñas por equipo, falla silenciosamente
      if (pastSubmissions >= MAX_SUBMISSIONS_PER_DEVICE) {
        setPassword(''); 
        setScore(0);
        setCrackTime('');
        return;
      }

      // Si no ha pasado el tiempo de enfriamiento, falla silenciosamente
      const timePassed = now - lastSubmitTime;
      const requiredWait = COOLDOWN_SECONDS * 1000;
      if (timePassed < requiredWait) {
        setPassword(''); 
        setScore(0);
        setCrackTime('');
        return;
      }
    }

    setIsChecking(true);

    // --- 2. FILTRO DE PALABRAS OFENSIVAS ---
    const isOffensive = isProfane(password); 
    if (isOffensive) {
      // Si tiene lenguaje ofensivo, falla silenciosamente
      setPassword(''); 
      setScore(0);
      setCrackTime('');
      setIsChecking(false);
      return; 
    }

    // --- 3. EVALUACIÓN Y ENVÍO ---
    const pwnedCount = await checkPasswordBreach(password);
    const isValid = pwnedCount === 0;
    
    let securityPercentage = 0;
    if (!isValid) {
      securityPercentage = 0; 
    } else {
      const percentageMap = [10, 25, 50, 75, 100];
      securityPercentage = percentageMap[score];
    }
    
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
          crack_time: crackTime,
          guesses: guesses
        }
      ]);

    if (error) {
      console.error("Error guardando en Supabase:", error);
      // Falla silenciosa de red (ya no hay alert)
    } else {
      // --- 4. REGISTRAR EL ÉXITO EN EL EQUIPO (Solo si no es admin) ---
      if (!isAdmin) {
        const currentSubmissions = parseInt(localStorage.getItem('pwd_submissions') || '0', 10);
        localStorage.setItem('pwd_submissions', (currentSubmissions + 1).toString());
        localStorage.setItem('pwd_last_submit', Date.now().toString());
      }
      
      if (onSuccess) onSuccess();
    }

    setIsChecking(false);
    setPassword('');
    setScore(0);
    setCrackTime('');
  };

  return { password, score, isChecking, handlePasswordChange, evaluateAndSubmit };
};