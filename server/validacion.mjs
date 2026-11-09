/* ==========================================================
   server/validacion.mjs  -  VALIDACIÓN EN EL SERVIDOR
   ----------------------------------------------------------
   Responsabilidad única: revisar que lo que llega en una
   petición sea aceptable antes de usarlo.

   ¿POR QUÉ VALIDAR AQUÍ SI YA SE VALIDA EN EL NAVEGADOR?

   Porque la validación del navegador NO es seguridad: es
   comodidad para quien usa la página. Cualquiera puede
   saltársela por completo sin tocar nuestro HTML, por ejemplo
   mandando la petición directamente desde una terminal:

     curl -X POST http://localhost:3000/api/preguntar \
          -H "Content-Type: application/json" \
          -d '{"pregunta": "<algo de 50000 caracteres>"}'

   El servidor es la única frontera que el atacante no controla,
   así que todo lo que entra se revisa OTRA VEZ aquí.

   REGLA GENERAL: nunca confiar en la entrada; aceptar solo lo
   que cumple las condiciones, en vez de intentar adivinar qué
   cosas son peligrosas y bloquearlas una por una.
   ========================================================== */

export const LARGO_MINIMO = 1;
export const LARGO_MAXIMO = 200;

/**
 * Quita caracteres de control (los invisibles: \u0000 a \u001F
 * y \u007F) que no aportan nada y sí pueden ensuciar los
 * registros del servidor o romper un JSON.
 *
 * Ojo: esto NO es protección contra XSS. La protección contra
 * XSS está en cómo el navegador PINTA el texto (textContent en
 * ui.mjs), no en intentar borrar etiquetas aquí. De hecho, la
 * base de datos contiene ejemplos con <script> a propósito y
 * deben poder viajar intactos.
 *
 * @param {string} texto
 * @returns {string}
 */
function limpiarTexto(texto) {
  return texto
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Valida el cuerpo de POST /api/preguntar.
 *
 * @param {unknown} cuerpo - lo que llegó en req.body
 * @returns {{valida: true, pregunta: string} | {valida: false, mensaje: string}}
 */
export function validarCuerpoPregunta(cuerpo) {
  // 1) ¿Llegó un objeto? Si el cliente manda texto plano o nada,
  //    req.body puede ser undefined o incluso null.
  if (cuerpo === null || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
    return { valida: false, mensaje: "El cuerpo de la petición debe ser un objeto JSON." };
  }

  // 2) ¿Existe el campo y es una cadena? Comprobamos el TIPO:
  //    si alguien manda { "pregunta": 42 } o { "pregunta": [] },
  //    llamar a .trim() sobre eso reventaría el servidor.
  if (typeof cuerpo.pregunta !== "string") {
    return { valida: false, mensaje: 'Falta el campo "pregunta" o no es texto.' };
  }

  const pregunta = limpiarTexto(cuerpo.pregunta);

  // 3) ¿Tiene un largo razonable?
  if (pregunta.length < LARGO_MINIMO) {
    return { valida: false, mensaje: "La pregunta no puede estar vacía." };
  }

  if (pregunta.length > LARGO_MAXIMO) {
    return {
      valida: false,
      mensaje: `La pregunta supera el máximo de ${LARGO_MAXIMO} caracteres.`,
    };
  }

  // Devolvemos el texto YA LIMPIO para que el resto del código
  // use esta versión y no la original.
  return { valida: true, pregunta };
}
