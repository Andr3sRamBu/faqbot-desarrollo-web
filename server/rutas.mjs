/* ==========================================================
   server/rutas.mjs  -  RUTAS DE LA API
   ----------------------------------------------------------
   Responsabilidad única: definir qué responde el servidor en
   cada dirección. Un Router de Express es un grupo de rutas
   que luego se "monta" bajo un prefijo (aquí: /api).

   AQUÍ ESTÁ LA GRAN VENTAJA DE HABER USADO MÓDULOS ES:
   este archivo importa buscador.mjs y data.mjs, que son los
   MISMOS archivos que usa el navegador. El motor de búsqueda
   está escrito UNA sola vez y funciona en los dos lados.
   Si mañana mejoramos el algoritmo, mejora en ambos.

   Eso se pudo hacer porque buscador.mjs no toca el DOM: no usa
   document, ni window, ni localStorage. En Node esos objetos
   no existen, así que un módulo que los usara fallaría aquí.
   ========================================================== */

import { Router } from "express";

import { faqs, temasDestacados } from "../js/data.mjs";
import { buscarRespuesta } from "../js/buscador.mjs";
import { validarCuerpoPregunta } from "./validacion.mjs";
import { limitarPeticiones } from "./limitador.mjs";

export const rutas = Router();

/** Lista de temas distintos, calculada una sola vez al arrancar. */
const TEMAS = [...new Set(faqs.map((faq) => faq.tema))];

const SIN_COINCIDENCIA =
  "No estoy seguro de haber entendido esa pregunta. Intenta usar otras palabras, " +
  "o elige uno de los temas sugeridos.";

/* ----------------------------------------------------------
   GET /api/salud
   ----------------------------------------------------------
   Ruta de diagnóstico: sirve para saber si el servidor está
   vivo. El frontend la llama al cargar la página (ver
   servidorDisponible() en api.mjs) para avisar si está
   trabajando con el servidor o con la base local.
   ---------------------------------------------------------- */
rutas.get("/salud", (req, res) => {
  // res.json() hace dos cosas: convierte el objeto a texto JSON
  // y pone la cabecera Content-Type: application/json.
  // El código 200 (OK) es el que Express envía por defecto.
  res.json({
    estado: "ok",
    nombre: "FAQ Bot API",
    version: "1.0.0",
    totalPreguntas: faqs.length,
    hora: new Date().toISOString(),
  });
});

/* ----------------------------------------------------------
   GET /api/temas
   ----------------------------------------------------------
   Devuelve los temas disponibles y las preguntas destacadas
   que el frontend muestra como botones de sugerencia.
   ---------------------------------------------------------- */
rutas.get("/temas", (req, res) => {
  res.json({
    total: TEMAS.length,
    temas: TEMAS,
    destacadas: temasDestacados,
  });
});

/* ----------------------------------------------------------
   GET /api/temas/:nombre
   ----------------------------------------------------------
   ":nombre" es un PARÁMETRO DE RUTA: lo que venga ahí queda
   en req.params.nombre. Por ejemplo:
     /api/temas/HTML5%20y%20CSS3  →  req.params.nombre = "HTML5 y CSS3"

   Esta ruta muestra el uso correcto del código 404: el
   servidor funciona bien, pero el recurso pedido no existe.
   ---------------------------------------------------------- */
rutas.get("/temas/:nombre", (req, res) => {
  const buscado = req.params.nombre.toLowerCase();
  const tema = TEMAS.find((t) => t.toLowerCase() === buscado);

  if (!tema) {
    return res.status(404).json({
      error: "Tema no encontrado",
      mensaje: `No existe el tema "${req.params.nombre}".`,
      temasDisponibles: TEMAS,
    });
  }

  const preguntas = faqs
    .filter((faq) => faq.tema === tema)
    .map(({ pregunta, respuesta }) => ({ pregunta, respuesta }));

  res.json({ tema, total: preguntas.length, preguntas });
});

/* ----------------------------------------------------------
   POST /api/preguntar
   ----------------------------------------------------------
   Es POST y no GET porque la pregunta viaja en el CUERPO de la
   petición, no en la URL. Con GET la pregunta quedaría escrita
   en la barra de direcciones y en los registros del servidor.

   El orden de los argumentos importa: primero el limitador
   (middleware) y después la función que responde. Express los
   ejecuta en ese orden y el limitador puede cortar la cadena.
   ---------------------------------------------------------- */
rutas.post("/preguntar", limitarPeticiones, (req, res) => {
  // 1) VALIDAR. Nunca usamos req.body sin revisarlo antes.
  const revision = validarCuerpoPregunta(req.body);

  if (!revision.valida) {
    // 400 Bad Request: la culpa es de la petición, no del servidor.
    return res.status(400).json({
      error: "Petición inválida",
      mensaje: revision.mensaje,
    });
  }

  // 2) BUSCAR, con el mismo motor que usa el navegador.
  const faq = buscarRespuesta(revision.pregunta, faqs);

  // 3) RESPONDER.
  //    Que no haya coincidencia NO es un error: la petición fue
  //    correcta y el servidor la atendió bien. Por eso va 200 y
  //    no 404, con una bandera "encontrada" para que el cliente
  //    sepa qué pasó.
  res.json({
    encontrada: Boolean(faq),
    pregunta: revision.pregunta,
    tema: faq ? faq.tema : null,
    respuesta: faq ? faq.respuesta : SIN_COINCIDENCIA,
  });
});
