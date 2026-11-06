from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
)
from fastapi.responses import Response

from app.services.audio_service import AudioService
from app.services.pitch_shifter import PitchShifter
from app.services.audio_converter import AudioConverter


router = APIRouter()

audio_service = AudioService()
pitch_shifter = PitchShifter()
audio_converter = AudioConverter()

TEMP_FOLDER = Path("temp")

VALID_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".flac",
    ".m4a",
    ".mp4",
}

MAX_FILE_SIZE = 100 * 1024 * 1024


@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
):
    try:
        return await audio_service.analyze(file)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print("Error procesando audio:", error)

        raise HTTPException(
            status_code=500,
            detail="Error interno procesando el audio.",
        )


@router.post("/transpose")
async def transpose_audio(
    file: UploadFile = File(...),
    semitones: int = Form(...),
):
    try:
        if semitones < -6 or semitones > 6:
            raise ValueError(
                "Los semitonos deben estar entre -6 y +6."
            )

        if not file.filename:
            raise ValueError(
                "El archivo no tiene nombre."
            )

        extension = Path(
            file.filename
        ).suffix.lower()

        if extension not in VALID_EXTENSIONS:
            raise ValueError(
                f"Formato no permitido: {extension}. "
                "Usa MP3, WAV, FLAC, M4A o MP4."
            )

        content = await file.read()

        if not content:
            raise ValueError(
                "El archivo está vacío."
            )

        if len(content) > MAX_FILE_SIZE:
            raise ValueError(
                "El archivo supera los 100 MB."
            )

        TEMP_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Todo se genera en una carpeta temporal que se
        # elimina al terminar, incluso si hay error. El MP3
        # se devuelve en la respuesta: no queda nada en disco.
        with TemporaryDirectory(
            dir=TEMP_FOLDER,
            ignore_cleanup_errors=True,
        ) as job_dir:
            job_path = Path(job_dir)

            temp_path = (
                job_path / f"original{extension}"
            )

            with open(temp_path, "wb") as output:
                output.write(content)

            processing_path = temp_path

            if extension == ".mp4":
                converted_path = (
                    job_path / "converted.mp3"
                )

                print("MP4 detectado.")
                print("Extrayendo pista de audio...")

                audio_converter.mp4_to_mp3(
                    input_path=str(temp_path),
                    output_path=str(converted_path),
                )

                processing_path = converted_path

            processed_wav_path = (
                job_path / "processed.wav"
            )

            print(
                f"Aplicando {semitones} semitonos..."
            )

            pitch_shifter.shift(
                input_path=str(processing_path),
                output_path=str(processed_wav_path),
                semitones=semitones,
            )

            processed_mp3_path = (
                job_path / "processed.mp3"
            )

            audio_converter.wav_to_mp3(
                input_path=str(processed_wav_path),
                output_path=str(processed_mp3_path),
            )

            processed_audio = (
                processed_mp3_path.read_bytes()
            )

        return Response(
            content=processed_audio,
            media_type="audio/mpeg",
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(
            "Error transponiendo audio:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Error procesando el cambio de tonalidad.",
        )
