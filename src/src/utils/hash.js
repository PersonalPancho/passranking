import CryptoJS from 'crypto-js';

export const getSHA1 = (text) => {
  // Convierte el texto a un hash SHA-1 en mayúsculas (requerido por HIBP)
  return CryptoJS.SHA1(text).toString().toUpperCase();
};