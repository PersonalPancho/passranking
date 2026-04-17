import axios from 'axios';
import { getSHA1 } from '../utils/hash';

export const checkPasswordBreach = async (password) => {
  const hash = getSHA1(password);
  const prefix = hash.substring(0, 5); // Los 5 primeros caracteres (lo que se envía)
  const suffix = hash.substring(5);    // El resto del hash (lo que comprobamos localmente)

  try {
    // Pedimos a la API todos los hashes vulnerados que empiezan con ese prefijo
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    // La respuesta es un texto plano con líneas separadas por saltos de línea
    const hashes = response.data.split('\n');

    // Buscamos si el sufijo de nuestra contraseña está en esa lista
    for (let line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(count, 10); // Devuelve cuántas veces ha sido filtrada
      }
    }
    return 0; // Si no está en la lista, no ha sido filtrada (es segura)
  } catch (error) {
    console.error("Error al consultar HIBP:", error);
    return -1; // En caso de error de red
  }
};