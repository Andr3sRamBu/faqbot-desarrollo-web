/* ==========================================================
   data.mjs  -  MÓDULO DE DATOS
   ----------------------------------------------------------
   Responsabilidad única: guardar la base de conocimiento.
   No sabe nada del DOM, ni de la búsqueda, ni del servidor.

   Se exporta con "export const" para que otros módulos la
   importen con: import { faqs } from "./data.mjs";
   Mientras el backend no esté publicado, esta base funciona
   como respaldo local (ver api.mjs y main.mjs).
   ========================================================== */

export const faqs = [

  // ---------- Formas de aplicar CSS ----------
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Cuáles son las formas de aplicar CSS y por qué existen varias?",
    palabrasClave: ["formas de aplicar css", "tipos de css", "por que hay varias formas de css", "como se aplica css", "maneras de usar css"],
    respuesta: "Existen 3 formas de aplicar CSS: en línea (inline), interno y externo. Existen varias porque cada una sirve para un caso distinto: algo rápido y puntual, una página aislada, o un sitio completo con estilos reutilizables." +
      "\n\nEjemplo (las 3 formas):\n" +
      "<p style=\"color: red;\">Inline</p>\n" +
      "<style> p { color: blue; } </style>\n" +
      "<link rel=\"stylesheet\" href=\"estilos.css\">"
  },
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Qué es el CSS en línea (inline) y cuándo se usa?",
    palabrasClave: ["css en linea", "css inline", "estilo en linea", "atributo style", "style inline"],
    respuesta: "El CSS en línea se escribe directamente en el atributo style=\"...\" de una etiqueta HTML. Se usa poco y solo para casos muy puntuales (una prueba rápida o un estilo generado dinámicamente), porque no se reutiliza y es difícil de mantener." +
      "\n\nEjemplo:\n<p style=\"color: red; font-size: 20px;\">Texto</p>"
  },
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Qué es el CSS interno y cuándo conviene usarlo?",
    palabrasClave: ["css interno", "etiqueta style", "css en el head", "style tag"],
    respuesta: "El CSS interno se escribe dentro de una etiqueta <style> en el <head> del documento. Conviene usarlo cuando los estilos son exclusivos de una sola página (por ejemplo, un ejercicio de una sola página HTML)." +
      "\n\nEjemplo:\n<style>\n  p { color: blue; }\n</style>"
  },
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Qué es el CSS externo y por qué es la forma más recomendada?",
    palabrasClave: ["css externo", "archivo css", "link css", "hoja de estilos externa", "vincular css", "enlazar css"],
    respuesta: "El CSS externo va en un archivo .css aparte, enlazado con <link rel=\"stylesheet\" href=\"...\">. Es la forma más recomendada porque separa contenido de presentación, se reutiliza en varias páginas y el navegador la puede cachear." +
      "\n\nEjemplo:\n<link rel=\"stylesheet\" href=\"style.css\">\n\n/* dentro de style.css */\np { color: green; }"
  },
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Qué símbolos se usan en los selectores CSS y qué significan?",
    palabrasClave: ["simbolos de un selector css", "punto en css", "numeral en css", "que significa el punto en css", "selectores css simbolos", "que significa el numeral css"],
    respuesta: "Algunos símbolos comunes: el punto (.) selecciona por clase (.miClase), el numeral (#) selecciona por id (#miId), el espacio selecciona descendientes, el mayor que (>) selecciona hijos directos, y la coma (,) agrupa varios selectores." +
      "\n\nEjemplo:\n.clase { }      /* selector de clase */\n#id { }         /* selector de id */\ndiv p { }       /* descendiente */\ndiv > p { }     /* hijo directo */\na:hover { }     /* pseudo-clase */"
  },
  {
    tema: "Formas de aplicar CSS",
    pregunta: "¿Cómo se combinan y varían los selectores CSS?",
    palabrasClave: ["combinar selectores css", "variaciones de selectores", "selector descendiente", "selector hijo directo", "pseudo clases", "mezclar selectores"],
    respuesta: "Los selectores se pueden combinar: '.a .b' (descendiente), '.a > .b' (hijo directo), '.a.b' (dos clases en el mismo elemento), '.a, .b' (agrupar), y también existen pseudo-clases como :hover o :focus para estados."
  },

  // ---------- Jerarquía y uso de etiquetas HTML ----------
  {
    tema: "Jerarquía de HTML",
    pregunta: "¿Qué es la jerarquía de etiquetas HTML y el árbol del documento?",
    palabrasClave: ["jerarquia de html", "arbol de etiquetas", "arbol del dom", "estructura de html", "arbol html"],
    respuesta: "El HTML se organiza como un árbol: <html> es la raíz, de ahí cuelgan <head> y <body>, y dentro de <body> cada etiqueta puede tener 'hijas' anidadas dentro de ella. A eso se le llama jerarquía o árbol de etiquetas." +
      "\n\nEjemplo:\n<html>\n  <body>\n    <header>...</header>\n    <main>\n      <section>...</section>\n    </main>\n  </body>\n</html>"
  },
  {
    tema: "Jerarquía de HTML",
    pregunta: "¿Cuáles son las reglas básicas de anidación de etiquetas HTML?",
    palabrasClave: ["reglas de anidacion", "anidar etiquetas html", "etiquetas mal anidadas", "anidar html"],
    respuesta: "Una etiqueta que se abre dentro de otra debe cerrarse antes que la de afuera (no se pueden 'cruzar' las etiquetas), y algunas etiquetas solo aceptan ciertos hijos válidos (por ejemplo <li> debe ir dentro de <ul> u <ol>, <tr> dentro de <table>)." +
      "\n\nEjemplo:\n<!-- Correcto -->\n<p><strong>texto</strong></p>\n\n<!-- Incorrecto (se cruzan las etiquetas) -->\n<p><strong>texto</p></strong>"
  },
  {
    tema: "Jerarquía de HTML",
    pregunta: "¿Cuál es la diferencia entre etiquetas en línea (inline) y de bloque (block)?",
    palabrasClave: ["etiquetas en linea y bloque", "inline vs block", "diferencia inline block", "elementos en linea y bloque", "diferencia display inline block"],
    respuesta: "Las etiquetas de bloque (<div>, <p>, <section>) ocupan todo el ancho disponible y empiezan en una línea nueva. Las etiquetas en línea (<span>, <a>, <strong>) solo ocupan el espacio de su contenido y no rompen el flujo del texto." +
      "\n\nEjemplo:\n<div>Soy un bloque</div>\n<span>Soy en línea</span>"
  },
  {
    tema: "Jerarquía de HTML",
    pregunta: "¿Qué es el orden semántico en HTML?",
    palabrasClave: ["orden semantico", "semantica en html", "orden logico del contenido", "estructura logica html"],
    respuesta: "El orden semántico significa organizar las etiquetas según el significado del contenido (header, nav, main, article, footer) y no solo por cómo se ve. Esto ayuda a lectores de pantalla, buscadores y a que el código sea más entendible."
  },
  {
    tema: "Jerarquía de HTML",
    pregunta: "¿Cómo funciona la jerarquía de encabezados (h1 a h6)?",
    palabrasClave: ["jerarquia de encabezados", "h1 h2 h3", "orden de titulos html", "h1 a h6", "orden de encabezados"],
    respuesta: "Debe haber un solo <h1> por página (el título principal) y los demás niveles (h2, h3...) se usan en orden, sin saltarse niveles, para representar subtítulos y secciones dentro de secciones. No se eligen por tamaño de letra sino por jerarquía de contenido." +
      "\n\nEjemplo:\n<h1>Título principal</h1>\n  <h2>Sección</h2>\n    <h3>Subsección</h3>"
  },

  // ---------- Fetch, Async/Await y seguridad en el Front-End ----------
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué es una API y qué es la Fetch API?",
    palabrasClave: ["que es una api", "fetch api", "que es fetch", "fetch", "para que sirve fetch", "que hace fetch", "api", "consumir api"],
    respuesta: "Una API es una interfaz que permite que dos programas se comuniquen (por ejemplo, tu página y un servidor). fetch() es la función de JavaScript para hacer peticiones HTTP (GET, POST, etc.) desde el navegador, generalmente pidiendo datos a una API." +
      "\n\nEjemplo:\nfetch(\"https://api.ejemplo.com/datos\")\n  .then(function (respuesta) { return respuesta.json(); })\n  .then(function (datos) { console.log(datos); });"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué son async y await en JavaScript?",
    palabrasClave: ["async await", "que es async", "que es await", "promesas javascript", "asincronia javascript", "codigo asincrono"],
    respuesta: "async y await son azúcar sintáctica para trabajar con promesas. Una función async siempre devuelve una promesa, y await 'pausa' esa función hasta que la promesa se resuelva, para que el código asíncrono se lea como si fuera secuencial." +
      "\n\nEjemplo:\nasync function obtenerDatos() {\n  const respuesta = await fetch(\"https://api.ejemplo.com/datos\");\n  const datos = await respuesta.json();\n  console.log(datos);\n}"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué es CORS y por qué aparece ese error?",
    palabrasClave: ["que es cors", "error de cors", "cross origin", "cors error", "politica del mismo origen", "same origin policy"],
    respuesta: "CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que bloquea peticiones entre dominios distintos a menos que el servidor lo permita explícitamente con ciertas cabeceras HTTP. Por eso a veces fetch() falla al llamar a otra API (¡y también por eso este chatbot NO usa fetch para cargar sus datos!)." +
      "\n\nEjemplo (cabecera que envía el servidor para permitirlo):\nAccess-Control-Allow-Origin: *"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué es un ataque XSS (Cross-Site Scripting)?",
    palabrasClave: ["que es xss", "ataque xss", "cross site scripting", "xss", "seguridad xss", "ataque de inyeccion"],
    respuesta: "XSS es un ataque donde alguien logra inyectar código JavaScript malicioso dentro de una página (por ejemplo, a través de un input que no se valida) para que se ejecute en el navegador de otros usuarios y robe datos o haga acciones no autorizadas." +
      "\n\nEjemplo de entrada peligrosa que un usuario podría escribir:\n<script>robarCookiesDelUsuario()</script>"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Cuál es la diferencia entre innerHTML y textContent?",
    palabrasClave: ["innerhtml vs textcontent", "diferencia innerhtml textcontent", "innerhtml", "textcontent"],
    respuesta: "innerHTML interpreta el string como HTML (puede crear etiquetas nuevas, pero también ejecutar código malicioso si viene de un usuario). textContent inserta el string como texto plano, sin interpretarlo como HTML, por lo que es mucho más seguro con datos que no controlas." +
      "\n\nEjemplo:\nelemento.innerHTML = entradaUsuario;   // riesgoso\nelemento.textContent = entradaUsuario; // seguro"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Por qué usar createElement + textContent en vez de innerHTML?",
    palabrasClave: ["createelement textcontent", "por que no usar innerhtml", "document createelement", "crear elemento del dom"],
    respuesta: "Crear el elemento con document.createElement() y ponerle el texto con .textContent evita que datos de un usuario se interpreten como HTML/JS, lo cual previene ataques XSS. Es más código, pero es la forma segura de insertar contenido dinámico (así está hecho este mismo chatbot)." +
      "\n\nEjemplo:\nconst parrafo = document.createElement(\"p\");\nparrafo.textContent = entradaUsuario;\ncontenedor.appendChild(parrafo);"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué es CSP (Content Security Policy)?",
    palabrasClave: ["que es csp", "content security policy", "csp", "politica de seguridad de contenido"],
    respuesta: "CSP es una cabecera HTTP que le dice al navegador de qué orígenes puede cargar scripts, estilos, imágenes, etc. Sirve como una capa extra de defensa contra XSS, porque aunque se inyecte un script, el navegador puede bloquear su ejecución si no viene de un origen permitido." +
      "\n\nEjemplo:\nContent-Security-Policy: default-src 'self'"
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué es la sanitización y cuándo se permite algo de HTML?",
    palabrasClave: ["que es sanitizacion", "sanitizar html", "permitir html de usuario", "sanitizar", "limpiar html", "escapar html"],
    respuesta: "Sanitizar es limpiar un texto para quitar o neutralizar código peligroso antes de mostrarlo. Se usa cuando sí necesitas permitir algo de HTML (como negritas en un comentario), filtrando solo etiquetas seguras y bloqueando <script> u otros atributos peligrosos, normalmente con una librería especializada (como DOMPurify)."
  },
  {
    tema: "Fetch y seguridad",
    pregunta: "¿Qué diferencia hay entre localStorage, sessionStorage y cookies HttpOnly?",
    palabrasClave: ["localstorage sessionstorage cookie", "diferencia localstorage sessionstorage", "cookie httponly", "almacenamiento web", "diferencia cookies y localstorage", "web storage"],
    respuesta: "localStorage guarda datos sin fecha de expiración (persisten aunque cierres el navegador). sessionStorage se borra al cerrar la pestaña. Ambos son accesibles desde JavaScript, por lo que no son ideales para datos muy sensibles. Una cookie HttpOnly, en cambio, no puede leerse desde JavaScript, lo que la hace más segura frente a ataques XSS para guardar cosas como tokens de sesión." +
      "\n\nEjemplo:\nlocalStorage.setItem(\"tema\", \"oscuro\");\nsessionStorage.setItem(\"token\", \"abc123\");"
  },

  // ---------- JavaScript moderno y DOM ----------
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cuáles son los pilares de una página web?",
    palabrasClave: ["pilares de una pagina web", "html css js para que sirve cada uno", "para que sirve html css js", "roles de html css js"],
    respuesta: "Los tres pilares son: HTML (estructura y contenido), CSS (presentación y estilo visual) y JavaScript (comportamiento e interactividad). Cada uno tiene una responsabilidad distinta y se complementan."
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Qué es JavaScript moderno (ES6+)?",
    palabrasClave: ["javascript moderno", "es6", "fundamentos del js moderno", "ecmascript 6", "novedades de javascript"],
    respuesta: "JavaScript moderno se refiere a las versiones desde ES6 (2015) en adelante, que agregaron let/const, funciones flecha, plantillas de texto (template literals), destructuring, módulos (import/export) y promesas, entre otras cosas que hacen el código más claro y corto." +
      "\n\nEjemplo:\nconst saludar = (nombre) => `Hola, ${nombre}!`;"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cómo se declaran variables con let, const y var?",
    palabrasClave: ["variables en javascript", "let const var", "diferencia let var const", "declarar variables", "como declaro una variable", "que es let", "que es const", "let", "const", "var"],
    respuesta: "let declara una variable que puede cambiar de valor, const declara una constante que no se puede reasignar, y var es la forma antigua (evítala) que no respeta bien el alcance de bloque. Hoy en día se recomienda usar const por defecto y let solo si el valor va a cambiar." +
      "\n\nEjemplo:\nlet edad = 20;\nconst nombre = \"Ana\";\nedad = 21;      // válido\n// nombre = \"Luis\"; // Error: no se puede reasignar un const"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cómo funcionan las funciones en JavaScript?",
    palabrasClave: ["funciones en javascript", "function declaration", "funcion flecha", "arrow function", "como se hace una funcion", "function"],
    respuesta: "Una función agrupa código reutilizable. Se puede declarar como 'function nombre() {}', como función anónima, o como función flecha 'const nombre = () => {}'. Las funciones flecha son más cortas y no tienen su propio 'this'." +
      "\n\nEjemplo:\nfunction sumar(a, b) {\n  return a + b;\n}\nconst sumar2 = (a, b) => a + b;"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cómo funcionan las comparaciones en JavaScript (== vs ===)?",
    palabrasClave: ["comparaciones en javascript", "diferencia == y ===", "igualdad estricta", "comparacion estricta", "triple igual"],
    respuesta: "== compara valores convirtiendo tipos si es necesario (comparación 'floja'), mientras que === compara valor Y tipo sin convertir nada (comparación estricta). Se recomienda usar siempre === para evitar resultados inesperados." +
      "\n\nEjemplo:\n\"5\" == 5    // true  (convierte el tipo)\n\"5\" === 5   // false (tipos distintos: string vs number)"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Qué son export e import en JavaScript?",
    palabrasClave: ["export import javascript", "modulos de javascript", "que es un modulo js", "modulos javascript", "type module"],
    respuesta: "export e import permiten dividir el código en módulos: con export compartes una función, variable o clase desde un archivo, y con import la usas en otro archivo. Requieren usar <script type=\"module\"> y, generalmente, un servidor local (por eso este proyecto NO los usa, para que funcione sin servidor)." +
      "\n\nEjemplo:\n// archivo utilidades.js\nexport function saludar() { ... }\n\n// otro archivo\nimport { saludar } from \"./utilidades.js\";"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Qué es el DOM?",
    palabrasClave: ["que es el dom", "document object model", "dom", "arbol del dom"],
    respuesta: "El DOM (Document Object Model) es la representación en memoria del HTML como un árbol de objetos, que JavaScript puede leer y modificar. Gracias al DOM, JS puede cambiar textos, estilos o estructura de la página sin recargarla." +
      "\n\nEjemplo:\ndocument.title = \"Nuevo título\"; // cambia el título de la pestaña usando el DOM"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cómo se seleccionan elementos con querySelector y querySelectorAll?",
    palabrasClave: ["queryselector", "queryselectorall", "seleccionar elementos en js", "como seleccionar elementos del dom", "seleccionar elemento html", "buscar elemento en el dom"],
    respuesta: "document.querySelector('selector') devuelve el PRIMER elemento que coincide con ese selector CSS. document.querySelectorAll('selector') devuelve TODOS los que coinciden, como una lista (NodeList) sobre la que puedes iterar con forEach." +
      "\n\nEjemplo:\nconst boton = document.querySelector(\".mi-boton\");\nconst parrafos = document.querySelectorAll(\"p\");"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Cómo se escuchan eventos con addEventListener?",
    palabrasClave: ["escuchar eventos", "addeventlistener", "eventos en javascript", "eventos click", "manejar eventos"],
    respuesta: "elemento.addEventListener('evento', funcion) ejecuta 'funcion' cada vez que ocurre ese 'evento' sobre el elemento (por ejemplo 'click', 'submit', 'input'). Es la forma moderna de reaccionar a las acciones del usuario." +
      "\n\nEjemplo:\nboton.addEventListener(\"click\", function () {\n  console.log(\"¡Click!\");\n});"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Qué es la delegación de eventos?",
    palabrasClave: ["delegacion de eventos", "event delegation", "delegar eventos", "event target"],
    respuesta: "En vez de poner un listener en cada botón, pones UN listener en el elemento padre y usas event.target para saber en cuál hijo se hizo click. Es más eficiente, sobre todo cuando los elementos hijos se crean dinámicamente con JavaScript." +
      "\n\nEjemplo:\ncontenedor.addEventListener(\"click\", function (evento) {\n  if (evento.target.classList.contains(\"item\")) {\n    console.log(\"Click en:\", evento.target.textContent);\n  }\n});"
  },
  {
    tema: "JS moderno y DOM",
    pregunta: "¿Qué es la accesibilidad web y por qué importa?",
    palabrasClave: ["que es accesibilidad", "accesibilidad web", "a11y", "aria", "accesibilidad"],
    respuesta: "La accesibilidad (a11y) busca que cualquier persona, incluyendo quienes usan lectores de pantalla o navegan solo con teclado, pueda usar tu página. Se logra con HTML semántico, atributos como aria-live o alt en imágenes, buen contraste de color y foco visible en los elementos interactivos." +
      "\n\nEjemplo:\n<img src=\"foto.jpg\" alt=\"Estudiantes trabajando en un laboratorio de cómputo\">"
  },

  // ---------- HTML5 semántico, CSS3 básico y accesibilidad ----------
  {
    tema: "HTML5 y CSS3",
    pregunta: "¿Qué es HTML5 semántico y qué etiquetas incluye?",
    palabrasClave: ["html5 semantico", "etiquetas semanticas html5", "header nav main article section footer", "html5", "etiquetas semanticas", "semantica web"],
    respuesta: "HTML5 semántico son etiquetas que describen el significado de su contenido, no solo su apariencia: <header>, <nav>, <main>, <article>, <section>, <aside> y <footer> son ejemplos. Ayudan a la accesibilidad, al SEO y a que el código sea más legible." +
      "\n\nEjemplo:\n<header>...</header>\n<nav>...</nav>\n<main>...</main>\n<footer>...</footer>"
  },
  {
    tema: "HTML5 y CSS3",
    pregunta: "¿Qué es CSS3 y qué novedades trajo?",
    palabrasClave: ["que es css3", "novedades de css3", "css3 basico", "css3", "flexbox", "grid css"],
    respuesta: "CSS3 es la versión de CSS que introdujo características como Flexbox, Grid, animaciones y transiciones, bordes redondeados, sombras, y selectores más avanzados, permitiendo diseños más flexibles sin depender tanto de imágenes o JavaScript." +
      "\n\nEjemplo:\n.contenedor {\n  display: flex;\n  gap: 1rem;\n}"
  },
  {
    tema: "HTML5 y CSS3",
    pregunta: "¿Qué buenas prácticas de accesibilidad se aplican en HTML y CSS?",
    palabrasClave: ["buenas practicas de accesibilidad", "accesibilidad en html y css", "practicas de accesibilidad", "label input accesible"],
    respuesta: "Algunas buenas prácticas: usar etiquetas semánticas en vez de <div> para todo, poner texto alt en imágenes, asegurar buen contraste de color, no quitar el outline de :focus sin reemplazarlo, y usar <label> asociado a cada <input>." +
      "\n\nEjemplo:\n<label for=\"nombre\">Nombre</label>\n<input id=\"nombre\" type=\"text\">"
  }
];

/* Temas destacados para mostrar como botones de sugerencia rápida */
export const temasDestacados = [
  "¿Cuáles son las formas de aplicar CSS y por qué existen varias?",
  "¿Cuál es la diferencia entre etiquetas en línea (inline) y de bloque (block)?",
  "¿Qué es un ataque XSS (Cross-Site Scripting)?",
  "¿Cómo se escuchan eventos con addEventListener?",
  "¿Qué es HTML5 semántico y qué etiquetas incluye?"
];
