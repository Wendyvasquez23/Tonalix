# Music App — Audio Key Detection & Pitch Shifting

A web application to **detect the musical key of an audio track, transpose it by semitones, preview the original and processed audio, and download the result**.

Built with **React + TypeScript**, **NestJS**, and a **Python/FastAPI audio engine**.

> **Project status:** personal project under active development. Musical key detection is an estimate and may not always match the actual key, especially in complex recordings.

## Features

- Upload MP3, WAV, FLAC, M4A, and MP4 files (up to 100 MB in the current configuration).
- Extract audio from MP4 files before analysis and processing.
- Estimate musical key and mode (major/minor).
- Transpose audio from **−6 to +6 semitones**, preserving its approximate duration.
- Preview the original and processed tracks in the browser.
- Download the processed audio in MP3 format.
- Responsive dark-themed interface for desktop and mobile.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, CSS |
| Main API | NestJS, Node.js, Multer |
| Audio engine | Python, FastAPI, librosa, NumPy, SoundFile |
| Conversion | FFmpeg (via `imageio-ffmpeg`) |
| Deployment | Docker, Docker Compose, Nginx |

## Architecture

```text
Browser
   |
   v
React / Vite (served by Nginx in containers)
   |
   v
NestJS API :3000
   |
   v
FastAPI audio-engine :8000
   |-- Key detection
   |-- MP4 audio extraction
   |-- Pitch shifting
   `-- MP3 encoding
```

The browser interacts with NestJS for uploading and transposing files. NestJS forwards audio processing requests to the Python service.

## Project structure

```text
Music_App/
├── frontend/          # React + TypeScript interface
├── backend/           # NestJS HTTP API and uploads
├── audio-engine/      # FastAPI, key detection and pitch shifting
├── docker-compose.yml
└── README.md
```

## Run with Docker Compose

**Requirements:** Docker Engine or Docker Desktop with Compose.

From the repository root:

```bash
docker compose up --build -d
```

Default local URLs with the current Compose configuration:

| Service | Address |
| --- | --- |
| Web app | http://localhost:5173 |
| NestJS API | http://localhost:3000 |
| FastAPI | Internal Docker network (`http://audio-engine:8000`) |

Stop the services:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

> The FastAPI port is private in the suggested production-oriented Compose setup. To use Swagger locally, temporarily expose `8000:8000` on the `audio-engine` service and open `http://localhost:8000/docs`.

## Run locally without Docker

You'll need Node.js, Python, and the project dependencies installed.

**Audio engine** (PowerShell, from `audio-engine/`):

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

**Backend** (new terminal, from `backend/`):

```bash
npm install
npm run start:dev
```

**Frontend** (new terminal, from `frontend/`):

```bash
npm install
npm run dev
```

For local development, configure the NestJS audio-engine URL to `http://127.0.0.1:8000`. Inside Docker it should be `http://audio-engine:8000`.

## API endpoints

### NestJS (`http://localhost:3000`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/audio/upload` | Upload an audio file and obtain its key analysis |
| `POST` | `/audio/:storedFilename/transpose` | Generate a transposed version |

Upload request: `multipart/form-data` with a `file` field.

Transpose request example:

```http
POST /audio/your-stored-file.mp3/transpose
Content-Type: application/json

{
  "originalFilename": "song.mp3",
  "semitones": 2
}
```

### FastAPI (`http://audio-engine:8000` inside Docker)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/audio/analyze` | Analyze an uploaded file |
| `POST` | `/audio/transpose` | Transpose an uploaded file (`file` and `semitones` form fields) |
| `GET` | `/audio/processed/{filename}` | Serve a processed audio file |

## How it works

1. The user uploads an audio file in the React interface.
2. NestJS stores it and asks FastAPI to estimate its musical key.
3. The user selects the desired semitone adjustment.
4. FastAPI performs pitch shifting, then exports the result as MP3.
5. The results page displays the original and calculated target key, offers audio previews, and provides a download link.

## Notes and limitations

- **Key detection is probabilistic.** The reported correlation score should not be interpreted as a calibrated percentage of certainty.
- Pitch shifting can introduce artifacts, especially with large changes, dense mixes, or vocals.
- Files are currently stored locally (uploads, temporary files, and processed audio). For a public deployment, implement file cleanup, storage quotas, authentication/rate limits, and content validation using FFmpeg rather than trusting file extensions.
- The current processed-file URL may point directly to the audio engine. Before public deployment, proxy audio downloads through NestJS or your reverse proxy, and use HTTPS.
- Processing large audio files can be CPU- and memory-intensive. A background job queue is a future improvement.
- Only upload and process audio you have permission to use.

## Roadmap

- [x] Audio upload and validation
- [x] Basic musical-key estimation
- [x] Semitone selector
- [x] Original and processed audio playback
- [x] Audio transposition and MP3 export
- [x] Dockerized services
- [ ] Unified playback component for both audio versions
- [ ] Background processing and progress tracking
- [ ] Automatic temporary-file cleanup
- [ ] Persistent project history
- [ ] Improved key-detection evaluation and audio quality

## License

No license has been selected yet. Add a `LICENSE` file before distributing this project under a specific open-source license.
