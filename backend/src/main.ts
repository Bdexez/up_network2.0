import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FRONTEND_URL accepte plusieurs origines séparées par des virgules.
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  setupOpenApi(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  Logger.log(`API prête sur http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Documentation sur http://localhost:${port}/docs`, 'Bootstrap');
  Logger.log(`Origines CORS autorisées : ${origins.join(', ')}`, 'Bootstrap');
}

/**
 * Documentation OpenAPI exposée sur /docs. Les schémas sont déduits des DTO
 * par le plugin @nestjs/swagger (voir nest-cli.json) : aucun décorateur
 * @ApiProperty à maintenir en double des règles class-validator.
 */
function setupOpenApi(app: Parameters<typeof SwaggerModule.createDocument>[0]) {
  const config = new DocumentBuilder()
    .setTitle('Up Network — API ERP / CRM')
    .setDescription(
      [
        'Toutes les routes hors `/auth/login`, `/auth/register` et `/health`',
        'exigent un jeton Bearer.',
        '',
        'La société active est portée par le jeton : aucune route n’accepte',
        'de `companyId` en paramètre.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et session')
    .addTag('crm', 'Pistes, opportunités, activités, tiers')
    .addTag('sales', 'Devis, commandes, factures, règlements')
    .addTag('purchases', 'Commandes fournisseur')
    .addTag('stock', 'Catalogue, entrepôts, mouvements')
    .addTag('system', 'Utilisateurs, rôles, société')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

void bootstrap();
