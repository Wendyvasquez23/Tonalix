import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AudioUploader from "../components/AudioUploader";
import "../styles/studioPage.css";

import {
  uploadAudio,
  type AudioAnalysis,
} from "../services/audioUpload.service";

import {
  useAudioProject,
} from "../context/AudioProjectContext";



export default function StudioPage() {
  const navigate =
    useNavigate();

  const {
    setProject,
    clearProject,
  } =
    useAudioProject();

  const [
    audioFile,
    setAudioFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    audioId,
    setAudioId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    semitones,
    setSemitones,
  ] =
    useState(0);

  const [
    analysis,
    setAnalysis,
  ] =
    useState<AudioAnalysis | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const handleFileSelected =
    async (
      file: File,
    ) => {
      setAudioFile(
        file,
      );

      setAudioId(
        null,
      );

      setAnalysis(
        null,
      );

      setError("");

      setLoading(
        true,
      );

      try {
        const result =
          await uploadAudio(
            file,
          );

        setAudioId(
          result.id,
        );

        setAnalysis(
          result.analysis,
        );

        console.log(
          "Análisis recibido:",
          result,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible analizar el audio.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  const handleFileRemoved =
    () => {
      setAudioFile(
        null,
      );

      setAudioId(
        null,
      );

      setAnalysis(
        null,
      );

      setSemitones(
        0,
      );

      setError("");

      clearProject();
    };

  const handleContinue =
    () => {
      if (
        !audioFile ||
        !analysis ||
        !audioId
      ) {
        return;
      }

      setProject({
        file:
          audioFile,

        audioId,

        analysis,

        semitones,
      });

      navigate(
        "/results",
      );
    };

  return (
    <main className="studio-page">
      <div className="studio-page__container">

        <AudioUploader
          onFileSelected={
            handleFileSelected
          }
          onFileRemoved={
            handleFileRemoved
          }
          onSemitonesChange={
            setSemitones
          }
        />

        {loading && (
          <p className="studio-page__status">
            Analizando tonalidad...
          </p>
        )}

        {error && (
          <p className="studio-page__error">
            {error}
          </p>
        )}

        {analysis &&
          !loading && (
            <button
              type="button"
              className="studio-page__continue"
              onClick={
                handleContinue
              }
            >
              Continuar
            </button>
          )}

      </div>
    </main>
  );
}