# ⚽ GOAT Ranker — Frontend

Cliente web para rankear a los mejores futbolistas de todos los tiempos. Permite crear jugadores, calificarlos y armar una tier list visual.

No utiliza frameworks ni librerías externas — solo HTML, CSS y JavaScript vanilla con ES Modules.

## 🌍 Demo en vivo

**https://cuchito.live/juanpa/proy1/**

---

## 🔌 Funcionalidades

### Jugadores
- **Agregar jugador**: nombre (obligatorio), país, club y foto (archivo de imagen)
- **Listar jugadores**: grilla paginada de 10 por página con foto, rating y tier asignado
- **Buscar**: búsqueda en tiempo real por nombre (debounce de 400ms)
- **Calificar**: puntaje del 1 al 10 (acepta decimales); el promedio se muestra en la card
- **Eliminar**: borra el jugador y lo quita de la tier list automáticamente

### Tier List
- **Asignar tier**: seleccioná el tier (S / A / B / C / D / F) desde la card del jugador
- **Visualizar ranking**: sección con los tiers S→F y los jugadores rankeados en cada uno
- **Exportar PDF**: abre el diálogo de impresión del browser mostrando solo la tier list con el tema oscuro
- **Reset Tier List**: elimina toda la tier list de una sola llamada al backend, sin importar desde qué sesión o dispositivo se hayan agregado los jugadores (con confirmación)

---

## 🧠 Arquitectura

```
[ Browser ]
     ↓ fetch()
[ Frontend — HTML + CSS + JS (ES Modules) ]
     ↓ HTTP / JSON
[ Backend API — /juanpa/proy1/api ]
     ↓
[ PostgreSQL ]
```

El frontend no accede directamente a la base de datos. Toda la lógica de datos vive en el backend.

El estado local se guarda en `localStorage` bajo la clave `goat_ranking_entries` y se sincroniza automáticamente con el backend al cargar la página, lo que permite que los tier assignments sean consistentes entre distintas sesiones y dispositivos.

---

## 📁 Estructura

```
frontend/
├── index.html        # estructura HTML de la app
├── styles.css        # estilos + media query de impresión
└── js/
    ├── app.js        # inicialización, handlers y event listeners
    ├── api.js        # todas las llamadas al backend (fetch)
    ├── state.js      # estado global + localStorage
    └── ui.js         # funciones de renderizado del DOM
```

---

## 🌐 Conexión con el backend

La URL base se calcula dinámicamente:

```js
export const BASE_URL = `${window.location.origin}/juanpa/proy1/api`;
```

Endpoints que consume:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/players` | Lista paginada (params: `page`, `limit`, `q`) |
| POST | `/players` | Crear jugador (multipart/form-data) |
| DELETE | `/players/:id` | Eliminar jugador |
| POST | `/players/:id/ratings` | Enviar calificación |
| GET | `/ranking` | Obtener tier list agrupada por tier |
| POST | `/ranking` | Asignar jugador a un tier |
| PUT | `/ranking/:id` | Cambiar tier de un jugador |
| DELETE | `/ranking/:id` | Quitar jugador de la tier list |
| DELETE | `/ranking` | Resetear toda la tier list de una vez |

---

## 🐳 Despliegue

El frontend corre en un contenedor Docker con `nginx:alpine` que sirve los archivos estáticos directamente desde el filesystem.

El backend también corre en Docker. Desde la raíz del repo padre:

```bash
docker compose up --build
```

Servicios Docker:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `proy1-front` | `80` | Nginx sirviendo el frontend estático |
| `proy1-api` | `8001` | API REST (FastAPI) |
| `proy1-db` | `5432` | PostgreSQL 15 |

Las imágenes subidas por los usuarios se guardan en el volumen `proy1_uploads` (montado en `/app/uploads` del contenedor API).

**Desarrollo local:** abrí `frontend/index.html` directamente en el browser o servilo con cualquier servidor estático (ej: `python -m http.server`). La API debe estar corriendo en `localhost:8001` y el `BASE_URL` en `api.js` debe apuntar a ella.

---

## 🔗 Backend

👉 https://github.com/Pablownski/Back-Proy1

---

## 🎯 Características técnicas

- Fetch API nativa para consumir el backend
- ES Modules (`import`/`export`) sin bundler
- Estado en memoria + `localStorage` sincronizado con el backend al cargar
- Renderizado dinámico del DOM (sin frameworks)
- Delegación de eventos para la grilla de jugadores
- Reset bulk de la tier list vía `DELETE /ranking` (funciona cross-session)
- Arquitectura en capas: `api.js` → `state.js` → `ui.js` → `app.js`
