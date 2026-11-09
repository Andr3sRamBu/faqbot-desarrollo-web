/* ==========================================================
   demo-xss.mjs  -  DEMOSTRACIÓN DE SEGURIDAD
   ----------------------------------------------------------
   Esta es la ÚNICA parte de todo el proyecto donde se usa
   innerHTML, y se hace A PROPÓSITO, dentro de un recuadro
   aislado, para poder mostrar en vivo la diferencia frente a
   textContent.

   El chat de verdad (ui.mjs) nunca usa innerHTML.

   QUÉ DEMUESTRA: un ataque XSS (Cross-Site Scripting) ocurre
   cuando una página inserta texto que vino de fuera como si
   fuera código HTML. Si ese texto trae una etiqueta con un
   manejador de evento (por ejemplo onerror), el navegador lo
   ejecuta de verdad, con los permisos de la página: puede leer
   el localStorage, robar sesiones o enviar datos a otro sitio.
   ========================================================== */

export function inicializarDemoXss() {
  const formulario = document.querySelector("#xss-form");
  const entrada = document.querySelector("#xss-input");
  const cajaInsegura = document.querySelector("#demo-inseguro");
  const cajaSegura = document.querySelector("#demo-seguro");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que el formulario recargue la página

    const texto = entrada.value;

    // INSEGURO: el navegador interpreta el texto como HTML.
    // Si contiene <img src=x onerror="...">, ese JavaScript SE EJECUTA.
    cajaInsegura.innerHTML = texto;

    // SEGURO: el navegador lo trata siempre como texto plano,
    // sin importar qué contenga. Nunca se ejecuta como código.
    cajaSegura.textContent = texto;
  });
}
