/* ==========================================================
   server/limitador.mjs  -  LÍMITE DE PETICIONES
   ----------------------------------------------------------
   Responsabilidad única: impedir que una misma dirección IP
   inunde la API con peticiones.

   ¿PARA QUÉ SIRVE? Sin esto, un script puede mandar miles de
   peticiones por segundo y dejar el servidor sin recursos
   (un ataque de denegación de servicio). En Render, además,
   el plan gratuito tiene horas limitadas de ejecución.

   Es un middleware: una función que Express ejecuta ANTES de
   llegar a la ruta. Si todo está bien llama a next() y la
   petición sigue; si no, responde 429 y la petición se detiene.

   Guarda los datos en memoria (un Map). Es suficiente para un
   proyecto de clase; en un sistema real se usaría Redis, porque
   al reiniciarse el servidor esta memoria se borra y porque con
   varios servidores cada uno llevaría su propia cuenta.
   ========================================================== */

const VENTANA_MS = 60_000; // 1 minuto
const MAXIMO_POR_VENTANA = 30;

/** Map<ip, number[]> → por cada IP, las horas de sus peticiones recientes. */
const registro = new Map();

/* Cada cierto tiempo borramos las IP que ya no tienen peticiones
   recientes, para que el Map no crezca sin parar.
   unref() le dice a Node que este temporizador no debe impedir
   que el proceso termine cuando ya no haya nada más que hacer. */
setInterval(() => {
  const limite = Date.now() - VENTANA_MS;
  for (const [ip, tiempos] of registro) {
    const vigentes = tiempos.filter((t) => t > limite);
    if (vigentes.length === 0) registro.delete(ip);
    else registro.set(ip, vigentes);
  }
}, VENTANA_MS).unref();

/**
 * Middleware de Express.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function limitarPeticiones(req, res, next) {
  const ip = req.ip ?? "desconocida";
  const ahora = Date.now();
  const limite = ahora - VENTANA_MS;

  // Nos quedamos solo con las peticiones dentro del último minuto.
  const recientes = (registro.get(ip) ?? []).filter((t) => t > limite);

  if (recientes.length >= MAXIMO_POR_VENTANA) {
    const esperaSegundos = Math.ceil((recientes[0] + VENTANA_MS - ahora) / 1000);

    // Retry-After es la cabecera estándar para decirle al cliente
    // cuántos segundos debe esperar antes de reintentar.
    res.set("Retry-After", String(esperaSegundos));

    return res.status(429).json({
      error: "Demasiadas peticiones",
      mensaje: `Espera ${esperaSegundos} segundos antes de volver a preguntar.`,
    });
  }

  recientes.push(ahora);
  registro.set(ip, recientes);

  next(); // todo bien: que siga a la ruta
}
