import {
  NestFactory,
} from "@nestjs/core";

import {
  AppModule,
} from "./app.module.js";

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.enableCors({
    origin:
      "http://localhost:5173",

    methods: [
      "POST",
    ],
  });

  await app.listen(
    3000,
  );

  console.log(
    "Backend iniciado en http://localhost:3000",
  );
}

bootstrap();