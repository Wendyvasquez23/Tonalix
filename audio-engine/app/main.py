from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analysis import router as analysis_router


app = FastAPI(
    title="Music App Audio Engine",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    analysis_router,
    prefix="/audio",
    tags=["Audio"],
)


@app.get("/")
def root():
    return {
        "service": "audio-engine",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }