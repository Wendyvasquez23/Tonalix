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
      process.env.FRONTEND_URL,

    methods: [
      "POST",
    ],
  });

 const port = Number(process.env.PORT || 3000);

  await app.listen(
    port,
  );

  console.log(
    `Backend iniciado en ${port}`,
  );
}

bootstrap();