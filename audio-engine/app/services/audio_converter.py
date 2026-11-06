import subprocess
from pathlib import Path

import imageio_ffmpeg


class AudioConverter:

    def __init__(self):
        self.ffmpeg_path = (
            imageio_ffmpeg.get_ffmpeg_exe()
        )

        print(
            "FFmpeg encontrado en:",
            self.ffmpeg_path
        )

    def mp4_to_mp3(
        self,
        input_path: str,
        output_path: str,
    ):
        input_file = Path(input_path)
        output_file = Path(output_path)

        if not input_file.exists():
            raise FileNotFoundError(
                f"No existe el archivo de entrada: {input_file}"
            )

        output_file.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        command = [
            self.ffmpeg_path,
            "-y",
            "-i",
            str(input_file),
            "-vn",
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "2",
            str(output_file),
        ]

        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if process.returncode != 0:
            print("FFmpeg STDERR:")
            print(process.stderr)

            raise RuntimeError(
                "No fue posible extraer el audio del MP4."
            )

        if not output_file.exists():
            raise RuntimeError(
                "FFmpeg terminó pero no generó el archivo MP3."
            )

        return str(output_file)

    def wav_to_mp3(
        self,
        input_path: str,
        output_path: str,
    ):
        input_file = Path(input_path)
        output_file = Path(output_path)

        if not input_file.exists():
            raise FileNotFoundError(
                f"No existe el archivo WAV de entrada: {input_file}"
            )

        output_file.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        command = [
            self.ffmpeg_path,
            "-y",
            "-i",
            str(input_file),
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "2",
            str(output_file),
        ]

        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if process.returncode != 0:
            print("FFmpeg STDERR:")
            print(process.stderr)

            raise RuntimeError(
                "No fue posible convertir el WAV procesado a MP3."
            )

        if not output_file.exists():
            raise RuntimeError(
                "FFmpeg terminó pero no generó el MP3 final."
            )

        return str(output_file)