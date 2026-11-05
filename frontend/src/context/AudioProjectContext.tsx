import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  AudioAnalysis,
} from "../services/audioUpload.service";

type AudioProject = {
  file: File | null;

  audioId: string | null;

  analysis: AudioAnalysis | null;

  semitones: number;
};

type AudioProjectContextType = {
  project: AudioProject;

  setProject: (
    project: AudioProject,
  ) => void;

  clearProject: () => void;
};

const initialProject: AudioProject = {
  file: null,

  audioId: null,

  analysis: null,

  semitones: 0,
};

const AudioProjectContext =
  createContext<AudioProjectContextType | null>(
    null,
  );

type Props = {
  children: ReactNode;
};

export function AudioProjectProvider({
  children,
}: Props) {
  const [
    project,
    setProject,
  ] =
    useState<AudioProject>(
      initialProject,
    );

  const clearProject = () => {
    setProject(
      initialProject,
    );
  };

  return (
    <AudioProjectContext.Provider
      value={{
        project,
        setProject,
        clearProject,
      }}
    >
      {children}
    </AudioProjectContext.Provider>
  );
}

export function useAudioProject() {
  const context =
    useContext(
      AudioProjectContext,
    );

  if (!context) {
    throw new Error(
      "useAudioProject debe utilizarse dentro de AudioProjectProvider",
    );
  }

  return context;
}