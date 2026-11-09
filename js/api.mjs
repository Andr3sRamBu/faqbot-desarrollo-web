/* ==========================================================
   api.mjs  -  CLIENTE DEL BACKEND (fetch + async/await)
   ----------------------------------------------------------
   Responsabilidad única: hablar con el servidor de Express.
   Es el ÚNICO archivo del frontend que conoce la URL del
   backend y el único que llama a fetch().

   Así, el día que cambie la dirección del servidor (de
   localhost a la URL pública de Render) se toca UNA sola
   línea de UN solo archivo. La rúbrica pide exactamente eso:
   "la URL base se define en un solo lugar para pasar de local
   a producción".
   ========================================================== */

/* ----------------------------------------------------------
   1) URL BASE: UN SOLO LUGAR
   ----------------------------------------------------------
   No escribimos "http://localhost:3000" repartido por el
   código, porque en producción eso falla: el navegador de
   quien visite la página buscaría un servidor en SU propio
   computador, no en el nuestro.

   Detectamos dónde se está ejecutando la página y elegimos.
   ---------------------------------------------------------- */

const EN_DESARROLLO =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

export const API_BASE = EN_DESARROLLO
  ? "http://localhost:3000"
  : "https://TU-BACKEND.onrender.com"; // ← CAMBIAR al publicar en Render

/** Ruta concreta a la que le hacemos la petición. */
export const RUTA_PREGUNTAR = `${API_BASE}/api/preguntar`;

/** Si el servidor no contesta en este tiempo, cortamos la espera. */
const TIEMPO_MAXIMO_MS = 6000;

/* ----------------------------------------------------------
   2) UN ERROR PROPIO
   ----------------------------------------------------------
   Creamos una clase de error para poder distinguir "el
   servidor respondió con un error" de "no hubo red". Guardamos
   el código HTTP para decidir qué mensaje mostrar.
   ---------------------------------------------------------- */
export class ErrorApi extends Error {
  constructor(mensaje, estado = 0) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado; // 0 = ni siquiera llegó al servidor
  }
}

/**
 * Traduce un código HTTP a un mensaje que una persona entienda.
 * Nunca mostramos el error técnico crudo en pantalla.
 */
function mensajeSegunEstado(estado) {
  switch (estado) {
    case 400:
      return "La pregunta no llegó en el formato esperado. Intenta escribirla de nuevo.";
    case 404:
      return "El servidor no encontró esa ruta. Puede que la dirección del backend esté mal.";
    case 429:
      return "Enviaste muchas preguntas seguidas. Espera un momento y vuelve a intentar.";
    case 500:
      return "El servidor tuvo un problema interno. Intenta de nuevo en unos segundos.";
    default:
      return `El servidor respondió con el error ${estado}.`;
  }
}

/* ----------------------------------------------------------
   3) LA PETICIÓN
   ----------------------------------------------------------
   async/await en vez de .then() encadenado: se lee de arriba
   hacia abajo, como código normal, y permite usar try/catch.
   ---------------------------------------------------------- */

/**
 * Le pregunta al backend y devuelve su respuesta en JSON.
 *
 * @param {string} pregunta
 * @returns {Promise<{tema: string, pregunta: string, respuesta: string}>}
 * @throws {ErrorApi} si el servidor falla o no se puede alcanzar
 */
export async function preguntarAlServidor(pregunta) {
  let respuesta;

  try {
    respuesta = await fetch(RUTA_PREGUNTAR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El cuerpo viaja como texto: hay que convertirlo con JSON.stringify.
      body: JSON.stringify({ pregunta }),
      // AbortSignal.timeout cancela la petición si el servidor
      // se queda colgado (Render "duerme" los servicios gratuitos
      // y el primer llamado puede tardar).
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch (error) {
    // Aquí caen los fallos de RED: servidor apagado, sin internet,
    // CORS mal configurado o se acabó el tiempo de espera.
    // fetch NO lanza error por un 404 o un 500; eso se revisa abajo.
    const sinTiempo = error.name === "TimeoutError" || error.name === "AbortError";
    throw new ErrorApi(
      sinTiempo
        ? "El servidor tardó demasiado en responder."
        : "No se pudo conectar con el servidor.",
      0
    );
  }

  // IMPORTANTE: fetch solo falla si no hubo conexión.
  // Un 404 o un 500 llegan como respuesta "exitosa" para fetch,
  // por eso SIEMPRE hay que revisar response.ok a mano.
  if (!respuesta.ok) {
    throw new ErrorApi(mensajeSegunEstado(respuesta.status), respuesta.status);
  }

  return await respuesta.json();
}

/**
 * Pregunta rápida al servidor para saber si está vivo.
 * La usamos al cargar la página para avisar en qué modo estamos.
 *
 * @returns {Promise<boolean>}
 */
export async function servidorDisponible() {
  try {
    const respuesta = await fetch(`${API_BASE}/api/salud`, {
      signal: AbortSignal.timeout(3000),
    });
    return respuesta.ok;
  } catch {
    return false;
  }
}
