export type AudioAnalysis = {
  key: string;
  scale: "major" | "minor";
  confidence: number;
};

export type UploadAudioResponse = {
  id: string;

  filename: string;

  mimeType: string;

  size: number;

  converted: boolean;

  audioFormat: string;

  analysis: AudioAnalysis;
};

export async function uploadAudio(
  file: File,
): Promise<UploadAudioResponse> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await fetch(
      "http://localhost:3000/audio/upload",
      {
        method: "POST",
        body: formData,
      },
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      errorData?.message ??
        "No fue posible subir el audio.",
    );
  }

  return response.json();
}