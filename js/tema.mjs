/* ==========================================================
   tema.mjs  -  TEMA CLARO / OSCURO
   ----------------------------------------------------------
   Responsabilidad única: cambiar entre el tema claro y el
   oscuro y recordar la elección.

   Bootstrap 5.3 trae temas de color integrados: basta con
   poner data-bs-theme="dark" o "light" en la etiqueta <html>
   y TODOS los componentes se adaptan solos. No hay que
   reescribir colores a mano.
   ========================================================== */

import { leerTema, guardarTema } from "./almacenamiento.mjs";

const boton = document.querySelector("#boton-tema");
const etiquetaBoton = document.querySelector("#texto-boton-tema");

/** Aplica el tema al documento y actualiza el botón. */
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);

  const esOscuro = tema === "dark";

  // El texto del botón describe lo que VA A PASAR al pulsarlo.
  etiquetaBoton.textContent = esOscuro ? "Tema claro" : "Tema oscuro";
  boton.setAttribute(
    "aria-label",
    esOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
  );

  // aria-pressed le dice al lector de pantalla si el botón de
  // alternancia está activado. Se actualiza en cada cambio.
  boton.setAttribute("aria-pressed", String(esOscuro));
}

/**
 * Decide el tema inicial, en este orden:
 *  1. Lo que la persona eligió antes (localStorage).
 *  2. Si nunca eligió, lo que su sistema operativo prefiere.
 */
export function inicializarTema() {
  const guardado = leerTema(); // null en la primera visita

  const preferenciaDelSistema = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";

  aplicarTema(guardado ?? preferenciaDelSistema);

  boton.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-bs-theme");
    const nuevo = actual === "dark" ? "light" : "dark";
    aplicarTema(nuevo);
    guardarTema(nuevo); // ← esto es lo que sobrevive al cierre del navegador
  });
}
