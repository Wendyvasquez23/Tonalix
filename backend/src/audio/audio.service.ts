import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";

import { randomUUID } from "crypto";

import * as fs from "fs/promises";

import {
  AudioEngineClient,
} from "../integrations/audio-engine.client.js";

@Injectable()
export class AudioService {
  constructor(
    private readonly audioEngine:
      AudioEngineClient,
  ) {}

  async create(
    file: Express.Multer.File,
  ) {
    try {
      const analysis =
        await this.audioEngine.analyze(
          file.path,
          file.originalname,
        );

      return {
        id:
          randomUUID(),

        filename:
          file.originalname,

        mimeType:
          file.mimetype,

        size:
          file.size,

        converted:
          analysis.converted,

        audioFormat:
          analysis.audioFormat,

        analysis:
          analysis.analysis,
      };
    } catch (error) {
      console.error(
        "Error analizando audio:",
        error,
      );

      throw new InternalServerErrorException(
        "No fue posible analizar el audio.",
      );
    } finally {
      await this.removeUpload(
        file,
      );
    }
  }

  async transpose(
    file: Express.Multer.File,
    semitones: number,
  ): Promise<Buffer> {
    try {
      return await this.audioEngine.transpose(
        file.path,
        file.originalname,
        semitones,
      );
    } catch (error) {
      console.error(
        "Error transponiendo audio:",
        error,
      );

      throw new InternalServerErrorException(
        "No fue posible cambiar la tonalidad.",
      );
    } finally {
      await this.removeUpload(
        file,
      );
    }
  }

  async removeUpload(
    file: Express.Multer.File,
  ) {
    try {
      await fs.rm(
        file.path,
        {
          force: true,
        },
      );
    } catch (error) {
      // No debe ocultar la respuesta real de la petición.
      console.error(
        "No fue posible eliminar el archivo temporal:",
        file.path,
        error,
      );
    }
  }
}
