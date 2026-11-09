import {
  BadRequestException,
  Body,
  Controller,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { AudioService } from "./audio.service.js";

const audioUploadOptions = {
  storage: diskStorage({
    destination: "./uploads",

    filename: (
      req,
      file,
      callback,
    ) => {
      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}`;

      const extension =
        extname(
          file.originalname,
        ).toLowerCase();

      callback(
        null,
        `${uniqueName}${extension}`,
      );
    },
  }),

  fileFilter: (
    req: unknown,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ) => {
    const extension =
      extname(
        file.originalname,
      ).toLowerCase();

    const validExtensions = [
      ".mp3",
      ".wav",
      ".flac",
      ".m4a",
      ".mp4",
    ];

    if (
      !validExtensions.includes(
        extension,
      )
    ) {
      return callback(
        new BadRequestException(
          `Formato no permitido: ${extension}.`,
        ),
        false,
      );
    }

    callback(
      null,
      true,
    );
  },

  limits: {
    fileSize:
      100 *
      1024 *
      1024,
  },
};

@Controller("audio")
export class AudioController {
  constructor(
    private readonly audioService: AudioService,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor(
      "file",
      audioUploadOptions,
    ),
  )
  async uploadAudio(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "No se recibió ningún archivo.",
      );
    }

    return this.audioService.create(
      file,
    );
  }

  @Post("transpose")
  @UseInterceptors(
    FileInterceptor(
      "file",
      audioUploadOptions,
    ),
  )
  async transposeAudio(
    @UploadedFile()
    file: Express.Multer.File,

    @Body("semitones")
    rawSemitones: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        "No se recibió ningún archivo.",
      );
    }

    const semitones =
      Number(rawSemitones);

    if (
      !Number.isInteger(semitones) ||
      semitones < -6 ||
      semitones > 6
    ) {
      await this.audioService.removeUpload(
        file,
      );

      throw new BadRequestException(
        "Los semitonos deben ser un número entero entre -6 y +6.",
      );
    }

    const processedAudio =
      await this.audioService.transpose(
        file,
        semitones,
      );

    return new StreamableFile(
      processedAudio,
      {
        type: "audio/mpeg",
      },
    );
  }
}
