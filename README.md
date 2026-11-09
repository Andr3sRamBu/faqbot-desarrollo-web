# FAQ Bot · Desarrollo Web

Chatbot de preguntas frecuentes sobre HTML, CSS, JavaScript, el DOM y seguridad
en el front-end. Responde comparando la pregunta escrita contra una base de 34
preguntas, sin usar ninguna librería de inteligencia artificial.

Proyecto de la materia Desarrollo Web — UNISANGIL.

---

## Cómo ejecutarlo

Se necesita **Node.js 20 o superior** (`node --version` para comprobarlo).

```bash
# 1. Instalar las dependencias (solo la primera vez)
npm install

# 2. Crear el archivo de configuración a partir de la plantilla
#    Windows:
copy .env.example .env
#    macOS o Linux:
cp .env.example .env

# 3. Arrancar el servidor
npm start
```

Luego abrir **http://localhost:3000**.

Durante el desarrollo conviene `npm run dev`: usa `node --watch`, que reinicia
el servidor solo cada vez que se guarda un archivo.

> **Nota:** el proyecto usa módulos ES (`<script type="module">`), que el
> navegador bloquea bajo el protocolo `file://`. **No funciona abriendo
> `index.html` con doble clic**; hay que levantarlo con `npm start`.

---

## Estructura

```
chatbot/
├── index.html              Estructura y marcado semántico
├── package.json            Dependencias y scripts
├── .env                    Configuración local (NO se sube a Git)
├── .env.example            Plantilla de configuración (sí se sube)
├── .gitignore
│
├── css/
│   └── style.css           Solo lo que Bootstrap no trae
│
├── js/                     FRONTEND
│   ├── main.mjs            Orquestador: conecta todo y escucha eventos
│   ├── data.mjs            Base de conocimiento (34 preguntas)
│   ├── buscador.mjs        Motor de coincidencia  ← compartido
│   ├── api.mjs             Cliente del backend (fetch + async/await)
│   ├── almacenamiento.mjs  localStorage y sessionStorage
│   ├── ui.mjs              Todo lo que toca el DOM
│   ├── tema.mjs            Tema claro / oscuro
│   └── demo-xss.mjs        Demostración de seguridad
│
└── server/                 BACKEND
    ├── server.mjs          Arranque, middlewares, estáticos, 404 y errores
    ├── rutas.mjs           Las rutas de /api
    ├── validacion.mjs      Validación de la entrada
    └── limitador.mjs       Límite de peticiones por IP
```

Cada módulo tiene **una sola responsabilidad** y se comunica con los demás
mediante `export` / `import`.

---

## La API

Base local: `http://localhost:3000/api`

| Método | Ruta | Qué hace | Códigos |
|---|---|---|---|
| `GET` | `/api/salud` | Diagnóstico: ¿está vivo el servidor? | 200 |
| `GET` | `/api/temas` | Lista de temas y preguntas destacadas | 200 |
| `GET` | `/api/temas/:nombre` | Preguntas de un tema | 200, 404 |
| `POST` | `/api/preguntar` | Responde una pregunta | 200, 400, 413, 429 |

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/preguntar \
     -H "Content-Type: application/json" \
     -d '{"pregunta": "que es el dom"}'
```

```json
{
  "encontrada": true,
  "pregunta": "que es el dom",
  "tema": "JS moderno y DOM",
  "respuesta": "El DOM (Document Object Model) es la representación…"
}
```

Que no haya coincidencia **no es un error**: devuelve `200` con
`"encontrada": false`. El `404` se reserva para un recurso que no existe, como
un tema inventado.

---

## Decisiones técnicas

### Módulos ES compartidos entre cliente y servidor

El código está dividido en módulos `.mjs`. La ventaja más concreta:
**`server/rutas.mjs` importa los mismos `js/buscador.mjs` y `js/data.mjs` que
usa el navegador.** El motor de búsqueda está escrito una sola vez y funciona
en los dos lados; si se mejora el algoritmo, mejora en ambos.

Eso fue posible porque `buscador.mjs` no toca el DOM: no usa `document`, ni
`window`, ni `localStorage`. En Node esos objetos no existen, así que un módulo
que los usara fallaría en el servidor.

### Conexión cliente-servidor

`js/api.mjs` es el único archivo del frontend que conoce la dirección del
backend, definida en **una sola constante**:

```js
export const API_BASE = EN_DESARROLLO
  ? "http://localhost:3000"
  : "https://TU-BACKEND.onrender.com"; // ← cambiar al publicar
```

Usa `async/await`, revisa `response.ok` (porque `fetch` **no** lanza error ante
un 404 o un 500), traduce cada código HTTP a un mensaje entendible y corta la
espera a los 6 segundos con `AbortSignal.timeout`.

Si el servidor no responde, la aplicación **no se rompe**: responde con la base
local y lo avisa en pantalla con un mensaje de texto.

### Seguridad

| Medida | Dónde | Qué evita |
|---|---|---|
| `textContent` en vez de `innerHTML` | `js/ui.mjs` | XSS |
| Validación de tipo y largo | `server/validacion.mjs` | Entradas basura o enormes |
| CORS con lista de orígenes | `server/server.mjs` | Que otro sitio consuma la API |
| Variables de entorno | `.env` + `.gitignore` | Filtrar configuración en Git |
| Estáticos con lista explícita | `server/server.mjs` | Servir `.env` o `package.json` |
| Límite de 30 peticiones/minuto | `server/limitador.mjs` | Saturar el servidor |
| `express.json({ limit: "10kb" })` | `server/server.mjs` | Agotar la memoria |
| `nosniff`, `DENY`, sin `x-powered-by` | `server/server.mjs` | Clickjacking y huellas |

**La validación del navegador no es seguridad.** Cualquiera puede saltársela
mandando la petición desde una terminal; por eso el servidor valida otra vez
todo lo que entra. Comprobado:

```bash
curl -X POST http://localhost:3000/api/preguntar \
     -H "Content-Type: application/json" -d '{"pregunta": 42}'
# → 400 {"error":"Petición inválida","mensaje":"Falta el campo \"pregunta\" o no es texto."}
```

El chat **nunca** usa `innerHTML`. El único de todo el proyecto está en
`js/demo-xss.mjs`, aislado a propósito en un recuadro de demostración.

### Persistencia en el navegador

| Dato | Dónde | Por qué |
|---|---|---|
| Preferencia de tema | `localStorage` | Debe seguir viva la próxima visita |
| Historial del chat | `sessionStorage` | Pertenece solo a esta visita |

Todo pasa por `js/almacenamiento.mjs`, que convierte con `JSON.stringify` /
`JSON.parse`, maneja el `null` de la primera visita y envuelve cada acceso en
`try/catch` (en modo incógnito, tocar `localStorage` lanza excepción).

**No se guarda ningún dato sensible**: el almacenamiento del navegador no está
cifrado y se lee desde F12. El botón *Borrar datos* elimina todo lo guardado.

### Accesibilidad

- HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- `role="log"` + `aria-live="polite"` en el chat: cada mensaje nuevo se anuncia.
- Cada campo tiene su `<label for="…">` asociado.
- Enlace *Saltar al contenido* como primera parada del tabulador.
- `aria-pressed` en el botón de tema, actualizado en cada cambio.
- `role="alert"` para errores y `role="status"` para confirmaciones.
- Indicador "escribiendo…" con texto alternativo para lectores de pantalla.
- Los mensajes de éxito y error llevan **texto**, no solo color.
- `@media (prefers-reduced-motion: reduce)` desactiva las animaciones.

**Contraste medido** (mínimo WCAG AA para texto normal: 4.5:1)

| Combinación | Relación |
|---|---|
| Texto blanco sobre burbuja de usuario `#0a53be` | **7.01:1** |
| Etiqueta de tema `#cfe2ff` sobre `#0a53be` | **5.34:1** |
| Burbuja del bot, tema oscuro | **8.84:1** |
| Burbuja del bot, tema claro | **13.01:1** |

### Bootstrap

Bootstrap 5.3.3 por CDN con la versión fija en la URL. Se usan la cuadrícula
(`container`, `row`, `col-12 col-lg-8`), componentes (`navbar`, `card`,
`alert`, `badge`, `form-control`) y utilidades de espaciado y disposición.
El tema claro/oscuro se maneja con el atributo `data-bs-theme` de Bootstrap 5.3.

---

## Al publicar

1. **Backend en Render**: build `npm install`, start `npm start`. En el panel de
   Render hay que crear las variables de entorno `NODE_ENV=production` y
   `ORIGENES_PERMITIDOS` con la URL de Netlify. El `PORT` lo pone Render solo.
2. **Frontend en Netlify o Vercel**: publicar la raíz del repositorio.
3. Cambiar la URL de producción en `js/api.mjs` (una sola línea).

---

## Pendiente

- [ ] Despliegue: frontend en Netlify o Vercel, backend en Render
- [ ] Informe de Lighthouse con análisis
- [ ] Diagrama de componentes
- [ ] Repositorio en GitHub con commits frecuentes
