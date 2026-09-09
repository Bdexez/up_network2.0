import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import request from 'supertest';
import type { App } from 'supertest/types';

dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PERMISSION_CATALOG } from '../src/common/constants/permissions';

export interface TestContext {
  app: INestApplication<App>;
  prisma: PrismaService;
  /** Adresse d'écoute réelle, pour les tests qui passent par `fetch`. */
  baseUrl: string;
  close: () => Promise<void>;
}

/** Démarre l'application avec la même configuration qu'en production. */
export async function createTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  // Le serveur est mis en écoute une bonne fois : sinon supertest tente de le
  // démarrer à chaque requête, et des appels simultanés se marchent dessus.
  await app.listen(0);

  const prisma = app.get(PrismaService);

  return {
    app,
    prisma,
    baseUrl: await app.getUrl(),
    close: async () => {
      await app.close();
    },
  };
}

/** Insère le catalogue de permissions, prérequis de tout rôle. */
export async function seedPermissions(prisma: PrismaService) {
  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: {
        moduleName_resourceName_actionName: {
          moduleName: permission.moduleName,
          resourceName: permission.resourceName,
          actionName: permission.actionName,
        },
      },
      update: {},
      create: { ...permission, isSystem: true },
    });
  }
}

export interface TestTenant {
  companyId: number;
  userId: number;
  token: string;
  email: string;
}

/**
 * Crée une société isolée avec un administrateur, via l'API publique
 * d'inscription — le parcours réel, pas un raccourci en base.
 */
export async function createTenant(
  ctx: TestContext,
  suffix: string,
): Promise<TestTenant> {
  const email = `admin-${suffix}@test.local`;
  // Le username est plafonné à 20 caractères par RegisterDto : on le tronque
  // ici pour que les tests puissent utiliser des suffixes descriptifs.
  const username = `u-${suffix}`.slice(0, 20);

  const response = await request(ctx.app.getHttpServer())
    .post('/auth/register')
    .send({
      email,
      username,
      password: 'motdepasse123',
      companyName: `Société ${suffix}`,
    })
    .expect(201);

  return {
    companyId: response.body.user.company.id,
    userId: response.body.user.id,
    token: response.body.accessToken,
    email,
  };
}

/** Raccourci : requête authentifiée pour un locataire donné. */
export function as(ctx: TestContext, tenant: TestTenant) {
  const server = ctx.app.getHttpServer();
  const auth = (r: request.Test) =>
    r.set('Authorization', `Bearer ${tenant.token}`);

  return {
    get: (url: string) => auth(request(server).get(url)),
    post: (url: string, body?: unknown) =>
      auth(
        request(server)
          .post(url)
          .send(body ?? {}),
      ),
    patch: (url: string, body?: unknown) =>
      auth(
        request(server)
          .patch(url)
          .send(body ?? {}),
      ),
    delete: (url: string) => auth(request(server).delete(url)),
  };
}
