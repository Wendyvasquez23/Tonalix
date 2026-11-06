from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import UploadFile

from app.services.key_detector import KeyDetector
from app.services.audio_converter import AudioConverter


TEMP_FOLDER = Path("temp")

VALID_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".flac",
    ".m4a",
    ".mp4",
}

MAX_FILE_SIZE = 100 * 1024 * 1024


class AudioService:

    def __init__(self):
        TEMP_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.key_detector = KeyDetector()
        self.audio_converter = AudioConverter()

    async def analyze(
        self,
        file: UploadFile,
    ):
        # -----------------------------
        # VALIDAR NOMBRE
        # -----------------------------

        if not file.filename:
            raise ValueError(
                "El archivo no tiene nombre."
            )

        # -----------------------------
        # OBTENER EXTENSIÓN
        # -----------------------------

        extension = Path(
            file.filename
        ).suffix.lower()

        if extension not in VALID_EXTENSIONS:
            raise ValueError(
                f"Formato no permitido: {extension}. "
                "Usa MP3, WAV, FLAC, M4A o MP4."
            )

        # -----------------------------
        # LEER ARCHIVO
        # -----------------------------

        content = await file.read()

        if not content:
            raise ValueError(
                "El archivo está vacío."
            )

        if len(content) > MAX_FILE_SIZE:
            raise ValueError(
                "El archivo supera el límite de 100 MB."
            )

        # -----------------------------
        # PROCESAR EN CARPETA TEMPORAL
        # (se elimina al terminar, incluso si hay error)
        # -----------------------------

        print(
            "Archivo recibido:",
            file.filename,
        )

        print(
            "MIME detectado:",
            file.content_type,
        )

        TEMP_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )

        converted = False
        audio_format = extension

        with TemporaryDirectory(
            dir=TEMP_FOLDER,
            ignore_cleanup_errors=True,
        ) as job_dir:
            job_path = Path(job_dir)

            file_path = (
                job_path /
                f"original{extension}"
            )

            with open(
                file_path,
                "wb",
            ) as output:
                output.write(content)

            analysis_path = file_path

            # -----------------------------
            # SI ES MP4, EXTRAER AUDIO
            # -----------------------------

            if extension == ".mp4":

                converted = True

                converted_path = (
                    job_path /
                    "converted.mp3"
                )

                print(
                    "MP4 detectado. Extrayendo audio..."
                )

                self.audio_converter.mp4_to_mp3(
                    input_path=str(file_path),
                    output_path=str(
                        converted_path
                    ),
                )

                analysis_path = (
                    converted_path
                )

                audio_format = ".mp3"

            # -----------------------------
            # ANALIZAR TONALIDAD
            # -----------------------------

            print(
                "Analizando tonalidad..."
            )

            key_result = (
                self.key_detector.detect(
                    str(
                        analysis_path
                    )
                )
            )

        print(
            "Tonalidad detectada:",
            key_result,
        )

        # -----------------------------
        # RESPUESTA
        # -----------------------------

        return {
            "success": True,

            "filename":
                file.filename,

            "mimeType":
                file.content_type,

            "size":
                len(content),

            "originalFormat":
                extension,

            "audioFormat":
                audio_format,

            "converted":
                converted,

            "analysis": {
                "key":
                    key_result[
                        "key"
                    ],

                "scale":
                    key_result[
                        "scale"
                    ],

                "confidence":
                    key_result[
                        "confidence"
                    ],
            },
        }
