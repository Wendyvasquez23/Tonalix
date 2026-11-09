export async function transposeAudio(
  file: File,
  semitones: number,
  signal?: AbortSignal,
): Promise<Blob> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  formData.append(
    "semitones",
    semitones.toString(),
  );
  const api_url = import.meta.env.BACKEND_URL
  const response =
    await fetch(
      `${api_url}/audio/transpose`,
      {
        method: "POST",
        body: formData,
        signal,
      },
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      errorData?.message ??
        "No fue posible cambiar la tonalidad.",
    );
  }

  return response.blob();
}
