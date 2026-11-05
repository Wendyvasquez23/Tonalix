const NOTES = [
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
];

export function transposeKey(
  key: string,
  semitones: number,
) {
  const index =
    NOTES.indexOf(key);

  if (index === -1) {
    return key;
  }

  const newIndex =
    (
      index +
      semitones +
      12 * 10
    ) % 12;

  return NOTES[
    newIndex
  ];
}