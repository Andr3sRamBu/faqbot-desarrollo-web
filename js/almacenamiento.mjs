/* ==========================================================
   almacenamiento.mjs  -  PERSISTENCIA EN EL NAVEGADOR
   ----------------------------------------------------------
   Responsabilidad única: leer y escribir en localStorage y
   sessionStorage. Ningún otro módulo toca el almacenamiento
   directamente; todos pasan por aquí.

   ¿POR QUÉ CADA DATO VA DONDE VA?

   - La PREFERENCIA DE TEMA (claro/oscuro) va en localStorage
     porque es una decisión de la persona que debe seguir viva
     la próxima vez que entre, incluso mañana o la otra semana.

   - El HISTORIAL DEL CHAT va en sessionStorage porque pertenece
     a ESTA visita: si recarga la página por accidente no pierde
     la conversación, pero al cerrar la pestaña se borra sola.
     Guardarlo para siempre sería ruido y ocuparía espacio.

   QUÉ NO GUARDAMOS: nada sensible. Ni contraseñas, ni correos,
   ni tokens, ni datos personales. El almacenamiento del
   navegador NO está cifrado y cualquiera con acceso al equipo
   (o cualquier script inyectado) puede leerlo desde F12.
   ========================================================== */

/* Prefijo "faqbot:" para no chocar con otras páginas que corran
   en el mismo dominio (en localhost esto pasa muy fácil). */
const CLAVE_TEMA = "faqbot:tema";
const CLAVE_HISTORIAL = "faqbot:historial";

/* Tope de mensajes guardados: el almacenamiento tiene un límite
   (unos 5 MB) y una conversación infinita podría llenarlo. */
const MAX_MENSAJES = 50;

/**
 * Lee una clave y la convierte de texto a objeto.
 *
 * Todo va dentro de try/catch por dos motivos reales:
 *  1. En modo incógnito o con las cookies bloqueadas, el solo
 *     hecho de tocar localStorage lanza una excepción.
 *  2. Si el JSON guardado quedó corrupto, JSON.parse lanza error.
 * En cualquiera de los dos casos preferimos devolver el valor
 * por defecto antes que romper toda la aplicación.
 *
 * @param {Storage} almacen - localStorage o sessionStorage
 * @param {string} clave
 * @param {*} porDefecto - qué devolver si no hay nada guardado
 */
function leerJSON(almacen, clave, porDefecto) {
  try {
    const texto = almacen.getItem(clave);

    // PRIMERA VISITA: getItem devuelve null, no una cadena vacía.
    // Hay que comprobarlo explícitamente, porque JSON.parse(null)
    // devuelve null en silencio y eso esconde el caso.
    if (texto === null) {
      return porDefecto;
    }

    return JSON.parse(texto);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}" del almacenamiento:`, error);
    return porDefecto;
  }
}

/**
 * Convierte un valor a texto con JSON.stringify y lo guarda.
 * El almacenamiento del navegador SOLO guarda cadenas de texto:
 * si guardáramos un objeto directamente quedaría "[object Object]".
 *
 * @returns {boolean} true si se pudo guardar
 */
function escribirJSON(almacen, clave, valor) {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    // QuotaExceededError si se llenó, SecurityError si está bloqueado.
    console.warn(`No se pudo guardar "${clave}":`, error);
    return false;
  }
}

/* ----------------------------------------------------------
   TEMA (localStorage: sobrevive al cierre del navegador)
   ---------------------------------------------------------- */

/**
 * @returns {"light"|"dark"|null} null en la primera visita
 */
export function leerTema() {
  const tema = leerJSON(localStorage, CLAVE_TEMA, null);
  return tema === "light" || tema === "dark" ? tema : null;
}

/** @param {"light"|"dark"} tema */
export function guardarTema(tema) {
  return escribirJSON(localStorage, CLAVE_TEMA, tema);
}

/* ----------------------------------------------------------
   HISTORIAL (sessionStorage: solo dura esta visita)
   ---------------------------------------------------------- */

/**
 * Devuelve el historial de la visita actual.
 * Valida que sea un array de verdad: si alguien edita el
 * almacenamiento a mano desde F12 y deja basura, no queremos
 * que el resto del código reciba algo que no puede recorrer.
 *
 * @returns {Array<{texto: string, tipo: string, tema?: string}>}
 */
export function leerHistorial() {
  const historial = leerJSON(sessionStorage, CLAVE_HISTORIAL, []);
  return Array.isArray(historial) ? historial : [];
}

/** @param {Array<object>} mensajes */
export function guardarHistorial(mensajes) {
  // slice(-MAX_MENSAJES) se queda con los últimos N mensajes.
  return escribirJSON(sessionStorage, CLAVE_HISTORIAL, mensajes.slice(-MAX_MENSAJES));
}

/* ----------------------------------------------------------
   BORRADO (la persona siempre debe poder eliminar sus datos)
   ---------------------------------------------------------- */

/** ¿Hay algo guardado de esta aplicación? */
export function hayDatosGuardados() {
  try {
    return sessionStorage.getItem(CLAVE_HISTORIAL) !== null
        || localStorage.getItem(CLAVE_TEMA) !== null;
  } catch {
    return false;
  }
}

/**
 * Borra TODO lo que esta aplicación guardó, sin tocar las claves
 * de otras páginas (por eso usamos removeItem con nuestras claves
 * y no localStorage.clear(), que borraría lo de todo el dominio).
 */
export function borrarDatosGuardados() {
  try {
    sessionStorage.removeItem(CLAVE_HISTORIAL);
    localStorage.removeItem(CLAVE_TEMA);
    return true;
  } catch (error) {
    console.warn("No se pudieron borrar los datos guardados:", error);
    return false;
  }
}
