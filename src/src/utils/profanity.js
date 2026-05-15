import { Filter } from 'glin-profanity';

const filter = new Filter({
  languages: ['english', 'spanish'],
  detectLeetspeak: true,
  leetspeakLevel: 'aggressive',
  normalizeUnicode: true
});

// 1. DICCIONARIO INGLÉS (Raíces agresivas y variaciones)
const englishBlacklist = [
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'pussy', 'bastard',
  'whore', 'slut', 'cock', 'motherfucker', 'cocksucker', 'wanker', 'twat',
  'prick', 'douche', 'douchebag', 'shithead', 'bullshit', 'dipshit',
  'dumbass', 'jackass', 'scumbag', 'cum', 'jizz', 'bollocks', 'bugger',
  'crap', 'goddamn', 'horseshit', 'pecker', 'shitass', 'shitty', 'snatch',
  'sonofabitch', 'fuckface', 'fuckwad', 'fucktard', 'shitbrain', 'asshat',
  'asswipe', 'fag', 'faggot', 'nigger', 'nigga', 'dyke', 'tranny', 'skank',
  'bimbo', 'blowjob', 'handjob', 'tit', 'tits', 'vagina', 'penis', 'boobs'
];

// 2. DICCIONARIO ESPAÑOL GENERAL (Latinoamérica y España)
const spanishBlacklist = [
  'puto', 'puta', 'mierda', 'verga', 'cabron', 'pendejo', 'pendeja', 'zorra',
  'maricon', 'marica', 'joto', 'putita', 'putito', 'chingar', 'chingada',
  'carajo', 'cojones', 'culero', 'concha', 'conchuda', 'conchatumadre',
  'malparido', 'gonorrea', 'hijoeputa', 'hijueputa', 'hdp', 'ctm', 'ptm', 'alv',
  'pinga', 'pito', 'weon', 'wea', 'chupapija', 'chupaverga', 'mamaguevo',
  'puñeta', 'pinche', 'pirobo', 'cacorro', 'soplanucas', 'muerdealmohadas',
  'gilipollas', 'hostia', 'ramera', 'prostituta', 'perra', 'bastardo', 'rabo',
  'polla', 'mecagoen', 'cerote', 'mamabicho', 'singar'
];

// 3. DICCIONARIO BOLIVIANO / SUCRE (Modismos, jergas y ofensas locales)
const bolivianBlacklist = [
  'pvto', 'pvta', 'pvt0', // Variantes de leetspeak forzado
  'cojudo', 'cojuda', 'pelotudo', 'pelotuda', 'huevon', 'huevona', 'huevada',
  'opa', 'sonso', 'sonsa', 'llocalla', 'imilla', 'cagon', 'cagona',
  'mariconazo', 'putanga', 'putañero', 'maraco', 'rosquete', 'mariposon',
  'tortillera', 'machorra', 'chucha', 'poto', 'kellu', 'gil', 'macana',
  'cholo', 'cholero', 'cunumi', 'pajpaku', 'karikari', 'llokalla',
  'chupamedias', 'tiraco', 'pichicato', 'pichota', 'sacolero', 'clefero',
  'kelluro', 'mierdita', 'putazo', 'boludo'
];

// Unimos todas las listas en una sola matriz de destrucción
const hardcoreBlacklist = [...englishBlacklist, ...spanishBlacklist, ...bolivianBlacklist];

export const isProfane = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();

  // PASO 1: Verificación nativa de la librería glin-profanity
  if (filter.isProfane(lowerText)) return true;

  // PASO 2: Traducción Leetspeak manual
  const deLeet = lowerText
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/!/g, 'i')
    .replace(/\$/g, 's');

  // PASO 3: Extracción pura de letras (Destruye los sufijos y prefijos numéricos/especiales)
  const onlyLetters = deLeet.replace(/[^a-zñ]/g, '');

  // PASO 4: Verificamos la versión "desnuda" con la librería
  if (filter.isProfane(onlyLetters)) return true;

  // PASO 5: Búsqueda de Substring (La más restrictiva)
  // Revisa si alguna palabra de nuestras 3 listas está incrustada dentro del texto
  const containsBlacklisted = hardcoreBlacklist.some(badWord => 
    lowerText.includes(badWord) || 
    deLeet.includes(badWord) || 
    onlyLetters.includes(badWord)
  );

  if (containsBlacklisted) return true;

  return false;
};