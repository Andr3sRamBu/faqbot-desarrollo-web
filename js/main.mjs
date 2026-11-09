/* ==========================================================
   main.mjs  -  ORQUESTADOR
   ----------------------------------------------------------
   Es el único módulo que conoce a todos los demás. Su trabajo
   es conectar las piezas y escuchar los eventos; la lógica
   pesada vive en los otros archivos.

   Es el único <script> que carga el index.html, con
   type="module". Los demás llegan solos por los import.
   ========================================================== */

import { faqs, temasDestacados } from "./data.mjs";
import { buscarRespuesta } from "./buscador.mjs";
import { preguntarAlServidor, servidorDisponible, ErrorApi } from "./api.mjs";
import {
  leerHistorial,
  guardarHistorial,
  borrarDatosGuardados,
  hayDatosGuardados,
} from "./almacenamiento.mjs";
import * as ui from "./ui.mjs";
import { inicializarTema } from "./tema.mjs";
import { inicializarDemoXss } from "./demo-xss.mjs";

/* ----------------------------------------------------------
   ESTADO DE LA APLICACIÓN
   ---------------------------------------------------------- */

const LARGO_MAXIMO = 200;

const MENSAJE_BIENVENIDA =
  "¡Hola! Soy el FAQ Bot del curso de Desarrollo Web. Pregúntame sobre HTML, CSS, " +
  "JavaScript, el DOM o seguridad en el front-end, o elige un tema sugerido abajo.";

const MENSAJE_SIN_COINCIDENCIA =
  "No estoy seguro de haber entendido esa pregunta. Intenta usar otras palabras, " +
  "o elige uno de los temas sugeridos abajo.";

/** Copia en memoria de la conversación; se refleja en sessionStorage. */
let mensajes = [];

/** Guarda un mensaje en el estado y lo persiste en el navegador. */
function registrarMensaje(mensaje) {
  mensajes.push(mensaje);
  guardarHistorial(mensajes);
}

/* ----------------------------------------------------------
   VALIDACIÓN EN EL CLIENTE
   ----------------------------------------------------------
   Es una comodidad para quien usa la página, NO una medida de
   seguridad: cualquiera puede saltársela desde la consola.
   Por eso el servidor tendrá que validar otra vez lo mismo.
   ---------------------------------------------------------- */

/** @returns {string|null} el mensaje de error, o null si está bien */
function validarPregunta(texto) {
  const limpio = texto.trim();
  if (limpio.length === 0) return "Escribe una pregunta antes de enviar.";
  if (limpio.length > LARGO_MAXIMO) {
    return `La pregunta es muy larga (máximo ${LARGO_MAXIMO} caracteres).`;
  }
  return null;
}

/* ----------------------------------------------------------
   OBTENER LA RESPUESTA
   ----------------------------------------------------------
   Primero se intenta con el servidor. Si el servidor no está
   disponible (todavía no existe, está apagado o no hay red),
   se responde con la base local para que la aplicación siga
   siendo útil, y se avisa con texto en pantalla.
   ---------------------------------------------------------- */

async function obtenerRespuesta(pregunta) {
  try {
    const datos = await preguntarAlServidor(pregunta);
    return {
      texto: datos.respuesta,
      tema: datos.tema,
      origen: "servidor",
    };
  } catch (error) {
    // Dejamos el detalle técnico en la consola, para nosotros...
    if (error instanceof ErrorApi) {
      console.warn(`[api] ${error.name} ${error.estado}: ${error.message}`);
    } else {
      console.error("[api] Error inesperado:", error);
    }

    // ...y en pantalla mostramos un mensaje entendible.
    ui.mostrarAviso(
      "Sin conexión con el servidor: respondiendo con la base local de preguntas.",
      "warning"
    );

    const faq = buscarRespuesta(pregunta, faqs);
    return {
      texto: faq ? faq.respuesta : MENSAJE_SIN_COINCIDENCIA,
      tema: faq ? faq.tema : undefined,
      origen: "local",
    };
  }
}

/* ----------------------------------------------------------
   FLUJO PRINCIPAL: una pregunta de principio a fin
   ---------------------------------------------------------- */

async function manejarPregunta(textoPregunta) {
  const error = validarPregunta(textoPregunta);

  if (error) {
    ui.marcarEntradaInvalida(true);
    ui.mostrarAviso(error, "danger");
    ui.enfocarEntrada();
    return;
  }

  ui.marcarEntradaInvalida(false);
  ui.limpiarAvisos();

  const pregunta = textoPregunta.trim();

  // 1) Mostrar y guardar lo que escribió la persona
  const mensajeUsuario = { texto: pregunta, tipo: "user" };
  ui.renderizarMensaje(mensajeUsuario);
  registrarMensaje(mensajeUsuario);

  ui.limpiarEntrada();

  // 2) Estado de carga mientras se espera
  ui.bloquearEntrada(true);
  ui.mostrarEscribiendo();

  try {
    const respuesta = await obtenerRespuesta(pregunta);

    const mensajeBot = {
      texto: respuesta.texto,
      tipo: "bot",
      tema: respuesta.tema,
    };
    ui.renderizarMensaje(mensajeBot);
    registrarMensaje(mensajeBot);
  } finally {
    // "finally" se ejecuta pase lo que pase: así la interfaz
    // nunca se queda bloqueada si algo sale mal.
    ui.ocultarEscribiendo();
    ui.bloquearEntrada(false);
    ui.enfocarEntrada();
  }
}

/* ----------------------------------------------------------
   EVENTOS
   ---------------------------------------------------------- */

function conectarEventos() {
  // Envío del formulario (clic en Enviar o tecla Enter)
  document.querySelector("#chat-form").addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que la página se recargue
    manejarPregunta(ui.leerEntrada());
  });

  // Quitar la marca de error en cuanto empiece a corregir
  document.querySelector("#chat-input").addEventListener("input", () => {
    ui.marcarEntradaInvalida(false);
  });

  /* DELEGACIÓN DE EVENTOS:
     en vez de un addEventListener por cada botón de sugerencia,
     ponemos UNO SOLO en el contenedor padre y averiguamos con
     evento.target en cuál botón se hizo clic. Funciona también
     con botones creados después, y usa menos memoria. */
  document.querySelector("#suggestions-list").addEventListener("click", (evento) => {
    const boton = evento.target.closest(".suggestion-btn");
    if (!boton) return; // se hizo clic en el espacio vacío
    manejarPregunta(boton.textContent);
  });

  // Borrar los datos guardados
  document.querySelector("#boton-borrar").addEventListener("click", () => {
    borrarDatosGuardados();
    mensajes = [];
    ui.limpiarChat();
    iniciarConversacion();
    ui.mostrarAviso("Se borraron la conversación y las preferencias guardadas.", "success");
    ui.enfocarEntrada();
  });
}

/* ----------------------------------------------------------
   ARRANQUE
   ---------------------------------------------------------- */

/** Restaura la conversación de esta visita, o saluda si es nueva. */
function iniciarConversacion() {
  const historial = leerHistorial();

  if (historial.length > 0) {
    mensajes = historial;
    ui.renderizarHistorial(historial);
    ui.mostrarAviso("Recuperamos la conversación de esta visita.", "info");
    return;
  }

  const bienvenida = { texto: MENSAJE_BIENVENIDA, tipo: "bot" };
  mensajes = [];
  ui.renderizarMensaje(bienvenida);
  registrarMensaje(bienvenida);
}

async function iniciar() {
  inicializarTema();
  inicializarDemoXss();
  ui.generarBotonesSugerencia(temasDestacados);

  const habiaDatos = hayDatosGuardados();
  iniciarConversacion();
  conectarEventos();

  // Avisamos en qué modo está trabajando la aplicación.
  // No bloqueamos el arranque: esto corre en segundo plano, así
  // que la página ya se puede usar mientras se comprueba.
  const hayServidor = await servidorDisponible();

  if (hayServidor) {
    ui.mostrarAviso("Conectado al servidor: las respuestas vienen de la API.", "success");
  } else if (!habiaDatos) {
    ui.mostrarAviso(
      "Modo local: el servidor no está disponible, las respuestas salen de la base del navegador.",
      "info"
    );
  }
}

iniciar();
