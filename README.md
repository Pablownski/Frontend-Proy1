⚽ GOAT Ranker — Frontend

Cliente web para la aplicación GOAT Ranker, que permite crear, calificar y rankear futbolistas.

Este frontend consume una API REST utilizando JavaScript vanilla (fetch) y no utiliza frameworks ni librerías externas.

🧠 Arquitectura
[ Browser ]
     ↓ fetch()
[ Frontend (HTML + JS) ]
     ↓ HTTP JSON
[ Backend API ]
El frontend NO accede directamente a la base de datos
Toda la lógica de datos vive en el backend
El frontend solo maneja UI y estado
🚀 Tecnologías
HTML5
CSS3
JavaScript (ES Modules)
Fetch API
Nginx (para servir en Docker)
📁 Estructura del proyecto
frontend/
├── index.html
├── styles.css
├── js/
│   ├── app.js       # lógica principal
│   ├── api.js       # llamadas al backend
│   ├── state.js     # estado global
│   └── ui.js        # renderizado
├── Dockerfile
└── README.md
🌐 Conexión con el backend

El frontend consume la API desde:

export const BASE_URL = 'http://localhost:8001';




Asegúrate de que el backend esté corriendo en ese puerto.

🔌 Funcionalidades
Crear jugadores con imagen
Listar jugadores con paginación
Buscar jugadores por nombre
Eliminar jugadores
Calificar jugadores (1–10)
Asignar jugadores a tiers (S, A, B, C, D, F)
Visualizar ranking tipo tier list
🐳 Ejecución con Docker

Desde la raíz del proyecto:

docker compose up --build
🌍 Acceso
Frontend: http://localhost:5173
Backend: http://localhost:8001
⚠️ CORS

El navegador bloquea peticiones entre distintos orígenes (puertos distintos).
El backend debe permitir estas peticiones mediante CORS.

🧪 Ejecución sin Docker

Puedes abrir directamente:

index.html

Pero algunas funciones pueden fallar si el backend no permite CORS.


🎯 Características técnicas
Uso de fetch() nativo para consumir API
Manejo de estado en memoria + localStorage
Render dinámico del DOM
Arquitectura modular (separación de responsabilidades)
🔗 Backend

👉 (https://github.com/Pablownski/Back-Proy1)

🧠 Notas

Este proyecto demuestra:

consumo de APIs REST sin frameworks
separación frontend/backend
manejo de estado en cliente
interacción con servidor mediante HTTP
