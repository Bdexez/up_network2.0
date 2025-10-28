import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config(); // charge les variables d'environnement depuis .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Récupère l'URL du front depuis le .env
  const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // CORS
  app.enableCors({
    origin: frontUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si le front envoie cookies ou auth
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

void bootstrap();
