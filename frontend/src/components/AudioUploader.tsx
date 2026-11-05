import { useRef, useState } from "react";
import "../styles/AudioUploader.css";

type AudioUploaderProps = {
    onFileSelected?: (file: File) => void;
    onFileRemoved?: () => void;
    onSemitonesChange?: (semitones: number) => void;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const MIN_SEMITONES = -6;
const MAX_SEMITONES = 6;

const VALID_EXTENSIONS = [
    "mp3",
    "mp4",
    "wav",
    "flac",
    "m4a",
];

export default function AudioUploader({
    onFileSelected,
    onFileRemoved,
    onSemitonesChange,
}: AudioUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [isDragging, setIsDragging] =
        useState(false);

    const [error, setError] =
        useState("");

    const [semitones, setSemitones] =
        useState(0);

    const validateFile = (file: File) => {
        console.log("Archivo seleccionado:", {
            name: file.name,
            type: file.type,
            size: file.size,
        });

        const extension = file.name
            .split(".")
            .pop()
            ?.toLowerCase();
        console.log('extención:'+ extension);

        if (
            !extension ||
            !VALID_EXTENSIONS.includes(extension)
        ) {
            console.log(extension);
            setError(
                "Selecciona un archivo de audio válido. MP3, WAV, FLAC o M4A."
            );

            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                "El archivo no puede superar los 100 MB."
            );

            return false;
        }

        setError("");

        return true;
    };

    const handleFile = (file: File) => {
        if (!validateFile(file)) {
            return;
        }

        setSelectedFile(file);
        setSemitones(0);

        onFileSelected?.(file);
        onSemitonesChange?.(0);
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        handleFile(file);
    };

    const handleDrop = (
        event: React.DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(false);

        const file =
            event.dataTransfer.files?.[0];

        if (!file) {
            return;
        }

        handleFile(file);
    };

    const handleRemove = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();

        setSelectedFile(null);
        setError("");
        setSemitones(0);

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        onFileRemoved?.();
        onSemitonesChange?.(0);
    };

    const updateSemitones = (
        newValue: number
    ) => {
        const normalizedValue =
            Math.min(
                MAX_SEMITONES,
                Math.max(
                    MIN_SEMITONES,
                    newValue
                )
            );

        setSemitones(
            normalizedValue
        );

        onSemitonesChange?.(
            normalizedValue
        );
    };

    const decreaseSemitone = () => {
        updateSemitones(
            semitones - 1
        );
    };

    const increaseSemitone = () => {
        updateSemitones(
            semitones + 1
        );
    };

    const formatFileSize = (
        bytes: number
    ) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (
            bytes <
            1024 * 1024
        ) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };

    const getPitchDescription =
        () => {
            if (semitones === 0) {
                return "Tonalidad original";
            }

            const amount =
                Math.abs(semitones);

            const text =
                amount === 1
                    ? "semitono"
                    : "semitonos";

            if (
                semitones > 0
            ) {
                return `↑ Subir ${amount} ${text}`;
            }

            return `↓ Bajar ${amount} ${text}`;
        };

    const formattedSemitones =
        semitones > 0
            ? `+${semitones}`
            : semitones;

    return (
        <section className="audio-uploader">
            <h1 className="audio-uploader__title">
                Carga el archivo
            </h1>

            <div
                className={`
          audio-uploader__dropzone
          ${isDragging
                        ? "audio-uploader__dropzone--dragging"
                        : ""
                    }
        `}
                onDragOver={(
                    event
                ) => {
                    event.preventDefault();

                    setIsDragging(
                        true
                    );
                }}
                onDragLeave={() => {
                    setIsDragging(
                        false
                    );
                }}
                onDrop={handleDrop}
                onClick={() => {
                    if (
                        !selectedFile
                    ) {
                        inputRef.current?.click();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    className="audio-uploader__input"
                    type="file"
                    accept=".mp3,.wav,.flac,.m4a,audio/*"
                    onChange={
                        handleInputChange
                    }
                />

                {!selectedFile ? (
                    <>
                        <div className="audio-uploader__icon">
                            ♫
                        </div>

                        <p className="audio-uploader__main-text">
                            Arrastra tu
                            archivo de audio
                            aquí
                        </p>

                        <p className="audio-uploader__secondary-text">
                            o haz clic para
                            seleccionarlo
                        </p>

                        <span className="audio-uploader__formats">
                            MP3, MP4, WAV, FLAC
                            o M4A · Máximo
                            100 MB
                        </span>
                    </>
                ) : (
                    <div
                        className="audio-uploader__file"
                        onClick={(
                            event
                        ) => {
                            event.stopPropagation();
                        }}
                    >
                        <div className="audio-uploader__file-icon">
                            ♫
                        </div>

                        <div className="audio-uploader__file-info">
                            <strong>
                                {
                                    selectedFile.name
                                }
                            </strong>

                            <span>
                                {formatFileSize(
                                    selectedFile.size
                                )}
                            </span>

                            <small>
                                MIME detectado:
                                {" "}
                                {selectedFile.type ||
                                    "desconocido"}
                            </small>
                        </div>

                        <button
                            type="button"
                            className="audio-uploader__remove"
                            onClick={
                                handleRemove
                            }
                        >
                            Eliminar
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="audio-uploader__error">
                    {error}
                </p>
            )}

            {selectedFile && (
                <div className="audio-uploader__pitch">
                    <h2>
                        Modificar
                        tonalidad
                    </h2>

                    <p className="audio-uploader__pitch-help">
                        Selecciona
                        cuántos semitonos
                        quieres subir o
                        bajar.
                    </p>

                    <div className="audio-uploader__semitones">
                        <button
                            type="button"
                            className="audio-uploader__semitone-button"
                            onClick={
                                decreaseSemitone
                            }
                            disabled={
                                semitones ===
                                MIN_SEMITONES
                            }
                        >
                            −
                        </button>

                        <div className="audio-uploader__semitone-value">
                            <strong>
                                {
                                    formattedSemitones
                                }
                            </strong>

                            <span>
                                semitonos
                            </span>
                        </div>

                        <button
                            type="button"
                            className="audio-uploader__semitone-button"
                            onClick={
                                increaseSemitone
                            }
                            disabled={
                                semitones ===
                                MAX_SEMITONES
                            }
                        >
                            +
                        </button>
                    </div>

                    <div
                        className={`
              audio-uploader__pitch-result
              ${semitones > 0
                                ? "audio-uploader__pitch-result--up"
                                : semitones <
                                    0
                                    ? "audio-uploader__pitch-result--down"
                                    : ""
                            }
            `}
                    >
                        {
                            getPitchDescription()
                        }
                    </div>
                </div>
            )}
        </section>
    );
}