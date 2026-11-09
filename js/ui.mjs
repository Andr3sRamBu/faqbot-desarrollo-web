/* ==========================================================
   ui.mjs  -  INTERFAZ (DOM)
   ----------------------------------------------------------
   Responsabilidad única: pintar cosas en la pantalla.
   Este módulo no sabe buscar respuestas ni hablar con el
   servidor; solo recibe datos ya listos y los muestra.

   SEGURIDAD (XSS): aquí NUNCA se usa innerHTML con datos
   que vengan de la persona o del servidor. Todo se construye
   con createElement() y se escribe con textContent, que
   siempre trata el contenido como texto plano y jamás lo
   ejecuta como HTML.
   ========================================================== */

/* Los módulos ES se ejecutan con "defer" de forma automática,
   así que cuando corre esta línea el HTML ya está construido
   y querySelector encuentra los elementos sin problema. */
const chatLog = document.querySelector("#chat-log");
const listaSugerencias = document.querySelector("#suggestions-list");
const zonaAvisos = document.querySelector("#zona-avisos");
const entrada = document.querySelector("#chat-input");
const botonEnviar = document.querySelector("#send-btn");

/** Id del elemento "escribiendo…" para poder quitarlo luego. */
const ID_ESCRIBIENDO = "indicador-escribiendo";

/* ----------------------------------------------------------
   MENSAJES DEL CHAT
   ---------------------------------------------------------- */

/**
 * Dibuja una burbuja de mensaje en el chat.
 *
 * @param {object} mensaje
 * @param {string} mensaje.texto
 * @param {"user"|"bot"} mensaje.tipo
 * @param {string} [mensaje.tema] - etiqueta opcional del tema
 */
export function renderizarMensaje({ texto, tipo, tema }) {
  const burbuja = document.createElement("div");
  burbuja.className = `message message--${tipo}`;

  // Marcamos el autor para lectores de pantalla, que no ven
  // el color ni la posición de la burbuja.
  const autor = document.createElement("span");
  autor.className = "visually-hidden";
  autor.textContent = tipo === "user" ? "Tú: " : "FAQ Bot: ";
  burbuja.appendChild(autor);

  const parrafo = document.createElement("p");
  parrafo.className = "message__texto mb-0";
  parrafo.textContent = texto; // ← textContent, nunca innerHTML
  burbuja.appendChild(parrafo);

  if (tema) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "badge rounded-pill message__tema mt-2";
    etiqueta.textContent = `Tema: ${tema}`;
    burbuja.appendChild(etiqueta);
  }

  chatLog.appendChild(burbuja);
  desplazarAlFinal();
}

/** Pinta de un solo golpe una lista de mensajes (al restaurar el historial). */
export function renderizarHistorial(mensajes) {
  mensajes.forEach(renderizarMensaje);
}

/** Deja el chat vacío. */
export function limpiarChat() {
  chatLog.replaceChildren(); // más claro y seguro que innerHTML = ""
}

function desplazarAlFinal() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

/* ----------------------------------------------------------
   ESTADO DE CARGA
   ----------------------------------------------------------
   Mientras esperamos al servidor hay que mostrar que algo
   está pasando; si no, parece que la aplicación se congeló.
   ---------------------------------------------------------- */

export function mostrarEscribiendo() {
  if (document.getElementById(ID_ESCRIBIENDO)) return; // ya está puesto

  const burbuja = document.createElement("div");
  burbuja.id = ID_ESCRIBIENDO;
  burbuja.className = "message message--bot message--escribiendo";
  burbuja.setAttribute("role", "status");

  // Texto real para quien usa lector de pantalla...
  const texto = document.createElement("span");
  texto.className = "visually-hidden";
  texto.textContent = "El bot está escribiendo una respuesta";
  burbuja.appendChild(texto);

  // ...y tres puntos animados para quien ve la pantalla.
  const puntos = document.createElement("span");
  puntos.className = "puntos-escribiendo";
  puntos.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i++) {
    puntos.appendChild(document.createElement("span"));
  }
  burbuja.appendChild(puntos);

  chatLog.appendChild(burbuja);
  desplazarAlFinal();
}

export function ocultarEscribiendo() {
  document.getElementById(ID_ESCRIBIENDO)?.remove();
}

/** Bloquea o libera el formulario mientras se espera la respuesta. */
export function bloquearEntrada(bloquear) {
  entrada.disabled = bloquear;
  botonEnviar.disabled = bloquear;
  botonEnviar.setAttribute("aria-busy", String(bloquear));
}

/* ----------------------------------------------------------
   AVISOS (éxito / error / información)
   ----------------------------------------------------------
   La rúbrica pide "retroalimentación clara con mensajes de
   éxito y de error con TEXTO", no solo con color: alguien con
   daltonismo no distingue un borde rojo de uno verde.
   ---------------------------------------------------------- */

/**
 * @param {string} texto
 * @param {"success"|"danger"|"warning"|"info"} variante
 */
export function mostrarAviso(texto, variante = "info") {
  const aviso = document.createElement("div");
  aviso.className = `alert alert-${variante} py-2 px-3 mb-0 small d-flex gap-2 align-items-start`;

  // role="alert" interrumpe al lector de pantalla (para errores);
  // role="status" espera a que termine de leer (para lo demás).
  aviso.setAttribute("role", variante === "danger" ? "alert" : "status");

  const icono = document.createElement("span");
  icono.setAttribute("aria-hidden", "true");
  icono.textContent = { success: "✅", danger: "⚠️", warning: "⚠️", info: "ℹ️" }[variante];
  aviso.appendChild(icono);

  const mensaje = document.createElement("span");
  mensaje.textContent = texto;
  aviso.appendChild(mensaje);

  zonaAvisos.replaceChildren(aviso);
}

export function limpiarAvisos() {
  zonaAvisos.replaceChildren();
}

/* ----------------------------------------------------------
   BOTONES DE SUGERENCIA
   ---------------------------------------------------------- */

/** @param {string[]} temas */
export function generarBotonesSugerencia(temas) {
  // Creamos todo en un fragmento y lo insertamos UNA sola vez:
  // así el navegador repinta la página una vez y no cinco.
  const fragmento = document.createDocumentFragment();

  temas.forEach((pregunta) => {
    const boton = document.createElement("button");
    boton.type = "button"; // "button" y no "submit": no debe enviar el formulario
    boton.className = "btn btn-sm btn-outline-secondary rounded-pill suggestion-btn";
    boton.textContent = pregunta;
    fragmento.appendChild(boton);
  });

  listaSugerencias.replaceChildren(fragmento);
}

/* ----------------------------------------------------------
   AYUDAS PARA EL CAMPO DE TEXTO
   ---------------------------------------------------------- */

export function leerEntrada() {
  return entrada.value;
}

export function limpiarEntrada() {
  entrada.value = "";
}

export function enfocarEntrada() {
  entrada.focus();
}

/** Marca el campo como inválido para la validación visual de Bootstrap. */
export function marcarEntradaInvalida(invalida) {
  entrada.classList.toggle("is-invalid", invalida);
  entrada.setAttribute("aria-invalid", String(invalida));
}
