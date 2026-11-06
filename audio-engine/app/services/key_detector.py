import librosa
import numpy as np


class KeyDetector:

    NOTES = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ]

    MAJOR_PROFILE = np.array([
        6.35,
        2.23,
        3.48,
        2.33,
        4.38,
        4.09,
        2.52,
        5.19,
        2.39,
        3.66,
        2.29,
        2.88,
    ])

    MINOR_PROFILE = np.array([
        6.33,
        2.68,
        3.52,
        5.38,
        2.60,
        3.53,
        2.54,
        4.75,
        3.98,
        2.69,
        3.34,
        3.17,
    ])

    def detect(self, file_path: str):

        y, sr = librosa.load(
            file_path,
            sr=None,
            mono=True,
        )

        chroma = librosa.feature.chroma_cqt(
            y=y,
            sr=sr,
        )

        chroma_mean = np.mean(
            chroma,
            axis=1,
        )

        correlations = []

        for index in range(12):

            major_profile = np.roll(
                self.MAJOR_PROFILE,
                index,
            )

            minor_profile = np.roll(
                self.MINOR_PROFILE,
                index,
            )

            major_correlation = np.corrcoef(
                chroma_mean,
                major_profile,
            )[0, 1]

            minor_correlation = np.corrcoef(
                chroma_mean,
                minor_profile,
            )[0, 1]

            correlations.append({
                "key": self.NOTES[index],
                "scale": "major",
                "score": major_correlation,
            })

            correlations.append({
                "key": self.NOTES[index],
                "scale": "minor",
                "score": minor_correlation,
            })

        best_match = max(
            correlations,
            key=lambda item: item["score"],
        )

        return {
            "key": best_match["key"],
            "scale": best_match["scale"],
            "confidence": round(
                float(best_match["score"]),
                3,
            ),
        }