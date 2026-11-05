import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import AudioPlayer from "../components/AudioPlayer";

import {
  transposeAudio,
} from "../services/audioTranspose.service";

import {
  useAudioProject,
} from "../context/AudioProjectContext";

import {
  transposeKey,
} from "../utils/transposeKey";

import "../styles/results-page.css";

export default function ResultsPage() {
  const navigate =
    useNavigate();

  const {
    project,
  } =
    useAudioProject();

  const [
    processedAudioUrl,
    setProcessedAudioUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    processing,
    setProcessing,
  ] =
    useState(false);

  const [
    processedReady,
    setProcessedReady,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    if (
      !project.file
    ) {
      return;
    }

    if (
      project.semitones === 0
    ) {
      return;
    }

    const controller =
      new AbortController();

    let objectUrl:
      string | null = null;

    const processAudio =
      async () => {
        try {
          setProcessing(
            true,
          );

          setProcessedReady(
            false,
          );

          setProcessedAudioUrl(
            null,
          );

          setError("");

          const result =
            await transposeAudio(
              project.file!,
              project.semitones,
              controller.signal,
            );

          if (
            controller.signal.aborted
          ) {
            return;
          }

          objectUrl =
            URL.createObjectURL(
              result,
            );

          setProcessedAudioUrl(
            objectUrl,
          );
        } catch (
          error
        ) {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          console.error(
            error,
          );

          setError(
            error instanceof Error
              ? error.message
              : "No fue posible procesar el audio.",
          );
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setProcessing(
              false,
            );
          }
        }
      };

    processAudio();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl,
        );
      }
    };

  }, [
    project.file,
    project.semitones,
  ]);

  if (
    !project.file ||
    !project.analysis
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  const {
    file,
    analysis,
    semitones,
  } = project;

  const newKey =
    transposeKey(
      analysis.key,
      semitones,
    );

  const formattedSemitones =
    semitones > 0
      ? `+${semitones}`
      : `${semitones}`;

  const downloadFilename =
    `${file.name.replace(
      /\.[^.]+$/,
      "",
    )} (${formattedSemitones}).mp3`;

  const scaleLabel =
    analysis.scale ===
    "major"
      ? "Mayor"
      : "Menor";

  return (
    <main className="results-page">
      <div className="results-page__container">

        <div className="results-page__topbar">
          <button
            type="button"
            className="results-page__back"
            onClick={() =>
              navigate("/")
            }
          >
            ← Volver
          </button>
        </div>

        <header className="results-page__header">
          <span className="results-page__eyebrow">
            Procesamiento de audio
          </span>

          <h1>
            Resultado
          </h1>

          <p>
            Compara la versión original
            con el audio transpuesto.
          </p>
        </header>

        <section className="result-card">
          <div className="result-card__top">

            <div>
              <span className="result-card__label">
                Audio original
              </span>

              <h2>
                {file.name}
              </h2>
            </div>

            <div className="key-badge">
              <span>
                Tonalidad
              </span>

              <strong>
                {analysis.key}{" "}
                {scaleLabel}
              </strong>
            </div>

          </div>

          <AudioPlayer
            file={file}
          />
        </section>

        <div className="change-card">
          <span className="change-card__label">
            Cambio seleccionado
          </span>

          <div className="change-card__value">
            {formattedSemitones}
          </div>

          <span className="change-card__unit">
            {Math.abs(
              semitones,
            ) === 1
              ? "semitono"
              : "semitonos"}
          </span>

          <div className="change-card__arrow">
            ↓
          </div>
        </div>

        <section className="result-card result-card--processed">

          <div className="result-card__top">

            <div>
              <span className="result-card__label">
                Audio procesado
              </span>

              <h2>
                Nueva versión
              </h2>
            </div>

            <div className="key-badge key-badge--new">
              <span>
                Nueva tonalidad
              </span>

              <strong>
                {newKey}{" "}
                {scaleLabel}
              </strong>
            </div>

          </div>

          {semitones === 0 && (
            <div className="result-state">
              <div className="result-state__icon">
                ♫
              </div>

              <p>
                No seleccionaste ningún cambio
                de tonalidad.
              </p>
            </div>
          )}

          {processing && (
            <div className="result-state">
              <div className="result-state__spinner" />

              <p>
                Procesando audio...
              </p>

              <small>
                Aplicando{" "}
                {formattedSemitones}{" "}
                {Math.abs(
                  semitones,
                ) === 1
                  ? "semitono"
                  : "semitonos"}
              </small>
            </div>
          )}

          {error && (
            <div className="result-state result-state--error">
              <p>
                {error}
              </p>
            </div>
          )}

          {processedAudioUrl &&
            !processing && (
              <div className="processed-audio">

                {!processedReady && (
                  <div className="result-state">
                    <div className="result-state__spinner" />

                    <p>
                      Cargando audio procesado...
                    </p>

                    <small>
                      Preparando reproducción
                    </small>
                  </div>
                )}

                <div
                  className="processed-audio__player-wrap"
                  style={{
                    display:
                      processedReady
                        ? "block"
                        : "none",
                  }}
                >
                  <audio
                    className="processed-audio__player"
                    controls
                    preload="metadata"
                    src={
                      processedAudioUrl
                    }
                    onLoadedMetadata={() => {
                      setProcessedReady(
                        true,
                      );
                    }}
                    onError={(event) => {
                      console.error(
                        "Error cargando audio procesado:",
                        event,
                      );

                      setError(
                        "No fue posible cargar el audio procesado.",
                      );
                    }}
                  />
                </div>

                {processedReady && (
                  <div className="processed-audio__actions">
                    <a
                      className="processed-audio__download"
                      href={
                        processedAudioUrl
                      }
                      download={
                        downloadFilename
                      }
                    >
                      Descargar audio
                    </a>
                  </div>
                )}

              </div>
            )}

        </section>

      </div>
    </main>
  );
}