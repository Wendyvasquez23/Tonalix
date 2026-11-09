# Music App — Detección y cambio de tonalidad de audio

Aplicación web para **detectar la tonalidad musical de una canción, transponerla por semitonos, escuchar el audio original y el procesado, y descargar el resultado**.

Desarrollada con **React + TypeScript**, **NestJS** y un **motor de procesamiento de audio en Python/FastAPI**.

> **Estado del proyecto:** proyecto personal en desarrollo. La detección de tonalidad es una estimación y puede diferir de la tonalidad real, especialmente en grabaciones complejas.

## Funcionalidades

- Carga de archivos MP3, WAV, FLAC, M4A y MP4 (hasta **100 MB** en la configuración actual).
- Extracción del audio de archivos MP4 antes del análisis y procesamiento.
- Estimación de la tonalidad y el modo musical (mayor o menor).
- Transposición de **−6 a +6 semitonos**, manteniendo aproximadamente la duración original.
- Reproducción del audio original y del audio procesado desde el navegador.
- Descarga del resultado en formato MP3.
- Interfaz oscura y adaptable a computadores, tabletas y móviles.

## Tecnologías utilizadas

| Capa | Tecnologías |
| --- | --- |
| Frontend | React, TypeScript, Vite, CSS |
| API principal | NestJS, Node.js, Multer |
| Motor de audio | Python, FastAPI, librosa, NumPy, SoundFile |
| Conversión de archivos | FFmpeg mediante `imageio-ffmpeg` |
| Despliegue | Docker, Docker Compose, Nginx |

## Arquitectura

```text
Navegador
   |
   v
React / Vite (servido por Nginx en contenedores)
   |
   v
API NestJS :3000
   |
   v
Motor FastAPI :8000
   |-- Detección de tonalidad
   |-- Extracción de audio MP4
   |-- Transposición por semitonos
   `-- Codificación a MP3
```

El navegador se comunica con NestJS para cargar archivos y solicitar cambios de tonalidad. NestJS envía las tareas de procesamiento al servicio especializado de Python.

## Estructura del proyecto

```text
Music_App/
├── frontend/          # Interfaz React + TypeScript
├── backend/           # API NestJS y archivos cargados
├── audio-engine/      # FastAPI, detección y transposición
├── docker-compose.yml
└── README.md
```

## Ejecución con Docker Compose

**Requisitos:** Docker Engine o Docker Desktop con Docker Compose.

Desde la raíz del repositorio, ejecuta:

```bash
docker compose up --build -d
```

Direcciones locales previstas en la configuración actual de Compose:

| Servicio | Dirección |
| --- | --- |
| Aplicación web | http://localhost:5173 |
| API NestJS | http://localhost:3000 |
| FastAPI | Red interna de Docker (`http://audio-engine:8000`) |

Para detener los servicios:

```bash
docker compose down
```

Para consultar los registros:

```bash
docker compose logs -f
```

> En la configuración orientada a producción, el puerto de FastAPI no se publica. Para acceder a Swagger durante el desarrollo, expón temporalmente `8000:8000` en el servicio `audio-engine` y abre `http://localhost:8000/docs`.

## Ejecución local sin Docker

Necesitas Node.js, Python y las dependencias del proyecto.

### 1. Motor de audio (Python)

Desde `audio-engine/`, en PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### 2. Backend (NestJS)

En otra terminal, desde `backend/`:

```bash
npm install
npm run start:dev
```

### 3. Frontend (React)

En otra terminal, desde `frontend/`:

```bash
npm install
npm run dev
```

Para desarrollo local, configura la URL del motor de audio en NestJS como `http://127.0.0.1:8000`. Dentro de Docker debe ser `http://audio-engine:8000`, mediante la variable `AUDIO_ENGINE_URL`.

## Endpoints de la API

### NestJS (`http://localhost:3000`)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/audio/upload` | Carga un audio y devuelve su análisis tonal |
| `POST` | `/audio/:storedFilename/transpose` | Genera una versión con la tonalidad modificada |

Para cargar un archivo, envía `multipart/form-data` con el campo `file`.

Ejemplo de solicitud de transposición:

```http
POST /audio/archivo-guardado.mp3/transpose
Content-Type: application/json

{
  "originalFilename": "cancion.mp3",
  "semitones": 2
}
```

### FastAPI (`http://audio-engine:8000` dentro de Docker)

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Verifica el estado del servicio |
| `POST` | `/audio/analyze` | Analiza un archivo cargado |
| `POST` | `/audio/transpose` | Transpone un archivo (`file` y `semitones` en el formulario) |
| `GET` | `/audio/processed/{filename}` | Sirve un audio procesado |

## ¿Cómo funciona?

1. El usuario carga un archivo desde la interfaz de React.
2. NestJS lo almacena y solicita a FastAPI una estimación de su tonalidad.
3. El usuario selecciona cuántos semitonos desea subir o bajar.
4. FastAPI aplica el cambio de tono y exporta el resultado como MP3.
5. La pantalla de resultados muestra la tonalidad original y la tonalidad calculada, permite escuchar ambas versiones y ofrece la descarga del audio procesado.

## Consideraciones y limitaciones

- **La detección de tonalidad no es infalible.** El valor de correlación obtenido no representa un porcentaje de certeza calibrado.
- El cambio de tonalidad puede introducir artefactos, especialmente en voces, mezclas densas o desplazamientos grandes.
- Los archivos se almacenan actualmente de forma local (`uploads`, `temp` y `processed`). Antes de publicar la aplicación, conviene incorporar limpieza automática, límites de almacenamiento, autenticación, límites de solicitudes y validación del contenido real mediante FFmpeg, sin confiar únicamente en la extensión.
- La URL del archivo procesado puede apuntar directamente a FastAPI. Para un despliegue público, es preferible servir las descargas mediante NestJS o un proxy inverso y utilizar HTTPS.
- El procesamiento de archivos grandes puede consumir bastante CPU y memoria. Una cola de trabajos en segundo plano es una mejora prevista.
- Utiliza únicamente archivos de audio que tengas permiso para procesar.
