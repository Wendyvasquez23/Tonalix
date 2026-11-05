import { useEffect, useRef, useState } from "react";
import "../styles/audioPlayer.css";

type AudioPlayerProps = {
  file: File;
};

export default function AudioPlayer({
  file,
}: AudioPlayerProps) {
  const audioRef =
    useRef<HTMLAudioElement>(null);

const [audioUrl, setAudioUrl] =
  useState<string | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  useEffect(() => {
    const url =
      URL.createObjectURL(file);

    setAudioUrl(url);

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const togglePlay = async () => {
    const audio =
      audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const handleTimeUpdate = () => {
    const audio =
      audioRef.current;

    if (!audio) return;

    setCurrentTime(
      audio.currentTime
    );
  };

  const handleLoadedMetadata =
    () => {
      const audio =
        audioRef.current;

      if (!audio) return;

      setDuration(
        audio.duration
      );
    };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const audio =
      audioRef.current;

    if (!audio) return;

    const newTime =
      Number(event.target.value);

    audio.currentTime =
      newTime;

    setCurrentTime(
      newTime
    );
  };

  const formatTime = (
    time: number
  ) => {
    if (
      !Number.isFinite(time)
    ) {
      return "0:00";
    }

    const minutes =
      Math.floor(time / 60);

    const seconds =
      Math.floor(time % 60);

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onPlay={() =>
          setIsPlaying(true)
        }
        onPause={() =>
          setIsPlaying(false)
        }
        onEnded={() =>
          setIsPlaying(false)
        }
        onTimeUpdate={
          handleTimeUpdate
        }
        onLoadedMetadata={
          handleLoadedMetadata
        }
      />

      <div className="audio-player__header">
        <div className="audio-player__icon">
          ♫
        </div>

        <div className="audio-player__info">
          <strong>
            {file.name}
          </strong>

          <span>
            Audio cargado
          </span>
        </div>
      </div>

      <div className="audio-player__controls">
        <button
          type="button"
          className="audio-player__play"
          onClick={
            togglePlay
          }
        >
          {isPlaying
            ? "❚❚"
            : "▶"}
        </button>

        <span className="audio-player__time">
          {formatTime(
            currentTime
          )}
        </span>

        <input
          className="audio-player__progress"
          type="range"
          min="0"
          max={
            duration || 0
          }
          step="0.1"
          value={
            currentTime
          }
          onChange={
            handleSeek
          }
        />

        <span className="audio-player__time">
          {formatTime(
            duration
          )}
        </span>
      </div>
    </div>
  );
}