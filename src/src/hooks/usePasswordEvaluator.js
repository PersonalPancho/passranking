import { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { checkPasswordBreach } from '../services/hibp';
import { supabase } from '../../lib/supabase';

export const usePasswordEvaluator = (onSuccess) => {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setScore(zxcvbn(val).score);
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
    
    // Insertar en Supabase
    const { error } = await supabase
      .from('ranking')
      .insert([
        {
          nickname: nickname,
          password: password,
          score: score,
          pwned_count: pwnedCount,
          is_valid: isValid,
          percentage: securityPercentage
        }
      ]);

    if (error) {
      console.error("Error guardando en Supabase:", error);
    } else {
      // Llamamos a onSuccess sin enviar datos, solo como señal de éxito
      if (onSuccess) onSuccess();
    }

    setIsChecking(false);
    setPassword('');
    setScore(0);
  };

  return { password, score, isChecking, handlePasswordChange, evaluateAndSubmit };
};