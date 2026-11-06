from pathlib import Path

import librosa
import soundfile as sf


class PitchShifter:

    def shift(
        self,
        input_path: str,
        output_path: str,
        semitones: int,
    ):
        y, sr = librosa.load(
            input_path,
            sr=None,
            mono=False,
        )

        shifted = librosa.effects.pitch_shift(
            y=y,
            sr=sr,
            n_steps=semitones,
        )

        output = Path(output_path)

        output.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        if shifted.ndim == 1:
            sf.write(
                output_path,
                shifted,
                sr,
            )
        else:
            sf.write(
                output_path,
                shifted.T,
                sr,
            )

        return {
            "outputPath": str(output),
            "sampleRate": sr,
            "semitones": semitones,
        }