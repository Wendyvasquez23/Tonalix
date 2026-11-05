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

  const response =
    await fetch(
      "http://localhost:3000/audio/transpose",
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
