import {
  IsInt,
  Max,
  Min,
} from "class-validator";

export class TransposeAudioDto {
  @IsInt()
  @Min(-6)
  @Max(6)
  semitones: number;
}