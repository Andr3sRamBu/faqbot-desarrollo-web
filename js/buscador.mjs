/* ==========================================================
   buscador.mjs  -  MOTOR DE COINCIDENCIA DE TEXTO
   ----------------------------------------------------------
   Responsabilidad única: dada una pregunta escrita por una
   persona, decidir cuál FAQ de la base se le parece más.

   No toca el DOM y no conoce el HTML: recibe texto, devuelve
   un objeto (o null). Eso lo hace reutilizable; de hecho el
   servidor de Express va a importar este MISMO archivo para
   responder en el backend, sin duplicar la lógica.

   No usa ninguna librería de IA: solo String, Array y Set.
   ========================================================== */

/**
 * Palabras muy comunes que no aportan significado a la búsqueda.
 * Usamos un Set en vez de un array porque buscar con .has() es
 * más rápido y más legible que .indexOf(x) !== -1.
 */
const PALABRAS_VACIAS = new Set([
  "el", "la", "los", "las", "un", "una", "de", "del", "que", "y",
  "en", "es", "para", "con", "se", "como", "por", "a", "lo"
]);

/** Por debajo de este puntaje consideramos que no hay coincidencia confiable. */
const UMBRAL_MINIMO = 2;

/**
 * Deja el texto en una forma comparable: sin mayúsculas, sin
 * tildes, sin signos y sin espacios de sobra.
 * Así "¿Qué es el DOM?" y "que es el dom" se vuelven iguales.
 *
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")                  // separa la letra de su tilde
    .replace(/[̀-ͯ]/g, "")   // elimina las tildes ya separadas
    .replace(/[¿?¡!.,;:]/g, "")        // elimina signos de puntuación
    .replace(/\s+/g, " ")              // colapsa espacios múltiples en uno
    .trim();
}

/**
 * Divide un texto ya normalizado en palabras significativas.
 * @param {string} textoNormalizado
 * @returns {string[]}
 */
function obtenerPalabrasClave(textoNormalizado) {
  return textoNormalizado
    .split(" ")
    .filter((palabra) => palabra.length > 0 && !PALABRAS_VACIAS.has(palabra));
}

/**
 * Calcula qué tanto se parece lo que escribió la persona a una FAQ.
 * Suma puntos por tres caminos distintos, de más a menos específico.
 *
 * @param {string} entradaNormalizada
 * @param {{pregunta: string, palabrasClave: string[]}} faq
 * @returns {number}
 */
function calcularPuntaje(entradaNormalizada, faq) {
  const palabrasEntrada = obtenerPalabrasClave(entradaNormalizada);

  // 1) Frases clave completas: valen el doble de su cantidad de palabras,
  //    porque acertar una frase entera es mucha más señal que una palabra.
  const puntajeFrases = faq.palabrasClave.reduce((suma, claveOriginal) => {
    const frase = normalizarTexto(claveOriginal);
    return entradaNormalizada.includes(frase)
      ? suma + frase.split(" ").length * 2
      : suma;
  }, 0);

  // 2) Palabra por palabra contra la pregunta "oficial" de la FAQ.
  const palabrasPregunta = new Set(obtenerPalabrasClave(normalizarTexto(faq.pregunta)));
  const puntajePregunta = palabrasEntrada
    .filter((palabra) => palabrasPregunta.has(palabra))
    .length;

  // 3) Palabra por palabra contra TODAS las palabras clave juntas.
  //    Ayuda cuando la persona escribe solo "dom" en vez de "que es el dom".
  const palabrasClaveSueltas = new Set(
    obtenerPalabrasClave(normalizarTexto(faq.palabrasClave.join(" ")))
  );
  const puntajeClaves = palabrasEntrada
    .filter((palabra) => palabrasClaveSueltas.has(palabra))
    .length;

  return puntajeFrases + puntajePregunta + puntajeClaves;
}

/**
 * Recorre toda la base de conocimiento y devuelve la FAQ con el
 * puntaje más alto, siempre que supere el umbral mínimo.
 *
 * Recibe "faqs" como parámetro (no lo lee de una variable global):
 * así esta función es pura y se puede probar o reutilizar en el
 * servidor pasándole otra base de datos.
 *
 * @param {string} preguntaUsuario
 * @param {Array<object>} faqs
 * @returns {object|null} la FAQ encontrada, o null si no hay coincidencia clara
 */
export function buscarRespuesta(preguntaUsuario, faqs) {
  const entradaNormalizada = normalizarTexto(preguntaUsuario);

  const mejor = faqs.reduce(
    (acumulado, faq) => {
      const puntaje = calcularPuntaje(entradaNormalizada, faq);
      return puntaje > acumulado.puntaje ? { faq, puntaje } : acumulado;
    },
    { faq: null, puntaje: 0 }
  );

  return mejor.puntaje >= UMBRAL_MINIMO ? mejor.faq : null;
}
