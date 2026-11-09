/* ==========================================================
   server/server.mjs  -  SERVIDOR EXPRESS
   ----------------------------------------------------------
   Punto de entrada del backend. Se arranca con "npm start".

   Su trabajo es, en este orden:
     1. Leer la configuración del archivo .env
     2. Montar los middlewares (CORS, JSON, seguridad)
     3. Servir los archivos del frontend
     4. Montar las rutas de la API bajo /api
     5. Atender los 404 y los errores
     6. Ponerse a escuchar en un puerto

   El ORDEN importa: Express ejecuta los middlewares de arriba
   hacia abajo, y el primero que responde corta la cadena.
   ========================================================== */

import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import cors from "cors";
import "dotenv/config"; // lee el archivo .env y lo pone en process.env

import { rutas } from "./rutas.mjs";

/* ----------------------------------------------------------
   RUTAS DEL SISTEMA DE ARCHIVOS
   ----------------------------------------------------------
   En módulos ES no existen __dirname ni __filename (son de
   CommonJS). Se reconstruyen a partir de import.meta.url, que
   es la URL de ESTE archivo.
   ---------------------------------------------------------- */
const ESTE_ARCHIVO = fileURLToPath(import.meta.url);
const CARPETA_SERVER = path.dirname(ESTE_ARCHIVO);
const RAIZ_PROYECTO = path.resolve(CARPETA_SERVER, "..");

/* ----------------------------------------------------------
   CONFIGURACIÓN DESDE VARIABLES DE ENTORNO
   ----------------------------------------------------------
   Nada de esto se escribe "a mano" en el código: así el mismo
   archivo funciona en tu computador y en Render sin cambiarle
   una sola línea, y los valores sensibles nunca llegan a Git.
   ---------------------------------------------------------- */
const PUERTO = process.env.PORT || 3000;
const ENTORNO = process.env.NODE_ENV || "development";

const ORIGENES_PERMITIDOS = (process.env.ORIGENES_PERMITIDOS || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter((origen) => origen.length > 0);

const app = express();

/* ----------------------------------------------------------
   1) CABECERAS DE SEGURIDAD
   ---------------------------------------------------------- */

// Por defecto Express anuncia "X-Powered-By: Express" en cada
// respuesta. Es información gratis para quien busque fallos
// conocidos de una versión concreta: mejor no darla.
app.disable("x-powered-by");

app.use((req, res, next) => {
  // Impide que el navegador "adivine" el tipo de un archivo.
  // Sin esto, un archivo subido como .txt pero con HTML dentro
  // podría ejecutarse como página.
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Impide que otra página meta la nuestra dentro de un <iframe>
  // invisible para engañar a quien hace clic (clickjacking).
  res.setHeader("X-Frame-Options", "DENY");

  // Limita qué información de nuestra URL se envía al salir
  // hacia otro sitio.
  res.setHeader("Referrer-Policy", "no-referrer");

  next();
});

/* ----------------------------------------------------------
   2) CORS
   ----------------------------------------------------------
   ¿QUÉ PROBLEMA RESUELVE? El navegador aplica la "política del
   mismo origen": una página servida desde un dominio no puede
   leer respuestas de otro dominio, salvo que ese otro dominio
   lo autorice. Esto evita que cualquier web que visites pueda
   leer, por ejemplo, tu correo.

   Nuestro caso: el frontend va a quedar en Netlify y la API en
   Render, que son dominios distintos. Sin CORS el navegador
   bloquearía todas las peticiones.

   NO usamos origin: "*" (abrir a todo el mundo). Declaramos
   una lista de orígenes permitidos que viene del .env, así en
   producción solo responde a nuestro propio frontend.
   ---------------------------------------------------------- */
const opcionesCors = {
  origin(origen, callback) {
    // Las peticiones sin origen son las que no vienen de una
    // página web: curl, Postman, o la propia página servida por
    // este mismo servidor. Se permiten.
    if (!origen) return callback(null, true);

    if (ORIGENES_PERMITIDOS.includes(origen)) {
      return callback(null, true);
    }

    // Importante: devolvemos "no permitido" sin lanzar una
    // excepción, para que el servidor no se caiga por esto.
    console.warn(`[cors] Origen rechazado: ${origen}`);
    return callback(null, false);
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(opcionesCors));

/* ----------------------------------------------------------
   3) LECTURA DEL CUERPO EN JSON
   ----------------------------------------------------------
   Sin este middleware, req.body llega como undefined.
   El límite de tamaño es una medida de seguridad: sin él,
   alguien podría mandar un cuerpo de cientos de megas y
   agotar la memoria del servidor.
   ---------------------------------------------------------- */
app.use(express.json({ limit: "10kb" }));

/* ----------------------------------------------------------
   4) ARCHIVOS DEL FRONTEND
   ----------------------------------------------------------
   Se publica SOLO lo que debe ser público, carpeta por carpeta,
   en vez de exponer la raíz del proyecto entera.

   Esto es a propósito: si hiciéramos express.static(RAIZ), el
   servidor estaría sirviendo también package.json, el README,
   node_modules y —lo más grave— el archivo .env con la
   configuración. Cualquiera podría leerlos escribiendo la URL.
   ---------------------------------------------------------- */
const OPCIONES_ESTATICOS = {
  // Los navegadores guardan en caché estos archivos durante
  // una hora en producción; en desarrollo no, para ver los
  // cambios al recargar.
  maxAge: ENTORNO === "production" ? "1h" : 0,
  setHeaders(res, archivo) {
    // Un módulo ES debe servirse con un tipo de JavaScript, o el
    // navegador se niega a ejecutarlo.
    if (archivo.endsWith(".mjs")) {
      res.setHeader("Content-Type", "text/javascript; charset=utf-8");
    }
  },
};

app.use("/css", express.static(path.join(RAIZ_PROYECTO, "css"), OPCIONES_ESTATICOS));
app.use("/js", express.static(path.join(RAIZ_PROYECTO, "js"), OPCIONES_ESTATICOS));

app.get("/", (req, res) => {
  res.sendFile(path.join(RAIZ_PROYECTO, "index.html"));
});

/* ----------------------------------------------------------
   5) LA API
   ----------------------------------------------------------
   Todas las rutas de rutas.mjs quedan colgando de /api:
   "/salud" se convierte en "/api/salud".

   El prefijo /api separa con claridad los datos de las
   páginas, y permite publicar el frontend y el backend por
   separado sin que los nombres choquen.
   ---------------------------------------------------------- */
app.use("/api", rutas);

/* ----------------------------------------------------------
   6) 404: NINGUNA RUTA COINCIDIÓ
   ----------------------------------------------------------
   Va casi al final, porque Express prueba las rutas en orden
   y esta acepta cualquier dirección. Si estuviera arriba,
   se tragaría todas las demás.
   ---------------------------------------------------------- */
app.use((req, res) => {
  // A quien pide datos le respondemos en JSON; a quien pide una
  // página, en texto. Así ninguno recibe algo que no entiende.
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      error: "Ruta no encontrada",
      mensaje: `La ruta ${req.method} ${req.path} no existe en esta API.`,
    });
  }

  res.status(404).type("text/plain").send("404 - Página no encontrada");
});

/* ----------------------------------------------------------
   7) MANEJADOR DE ERRORES
   ----------------------------------------------------------
   Express reconoce un manejador de errores porque tiene CUATRO
   parámetros (error, req, res, next). Si le quitas el "next"
   deja de funcionar como tal, aunque no lo uses.

   Aquí termina cualquier excepción que no se haya atendido
   antes, por ejemplo un JSON mal formado en el cuerpo.
   ---------------------------------------------------------- */
app.use((error, req, res, next) => {
  // El detalle técnico se queda en los registros del servidor,
  // donde solo lo vemos nosotros.
  console.error("[error]", error);

  // Un JSON mal escrito lo reporta express.json() así:
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "JSON inválido",
      mensaje: "El cuerpo de la petición no es un JSON válido.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Cuerpo demasiado grande",
      mensaje: "La petición supera el tamaño permitido.",
    });
  }

  // NUNCA se le manda el stack trace a quien hizo la petición:
  // revela rutas internas y versiones del servidor.
  res.status(500).json({
    error: "Error interno del servidor",
    mensaje: "Algo salió mal. Intenta de nuevo en unos segundos.",
  });
});

/* ----------------------------------------------------------
   8) A ESCUCHAR
   ---------------------------------------------------------- */
app.listen(PUERTO, () => {
  console.log(`\n  FAQ Bot API`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Entorno:  ${ENTORNO}`);
  console.log(`  Página:   http://localhost:${PUERTO}`);
  console.log(`  API:      http://localhost:${PUERTO}/api/salud`);
  console.log(`  CORS:     ${ORIGENES_PERMITIDOS.join(", ") || "(ninguno configurado)"}`);
  console.log(`  ─────────────────────────────────────\n`);
});
