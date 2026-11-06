import {
  Module,
} from "@nestjs/common";

import {
  AudioModule,
} from "./audio/audio.module.js";

@Module({
  imports: [
    AudioModule,
  ],
})
export class AppModule {}