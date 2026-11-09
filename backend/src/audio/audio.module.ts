import {
  Module,
} from "@nestjs/common";

import {
  AudioController,
} from "./audio.controller.js";

import {
  AudioService,
} from "./audio.service.js";

import {
  AudioEngineModule,
} from "../integrations/audio-engine.module.js";

@Module({
  imports: [
    AudioEngineModule,
  ],

  controllers: [
    AudioController,
  ],

  providers: [
    AudioService,
  ],
})
export class AudioModule {}