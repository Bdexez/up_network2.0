import request from 'supertest';
import { createTestApp, seedPermissions, type TestContext } from './helpers';

describe('Session et jetons (e2e)', () => {
  let ctx: TestContext;
  let suffix: string;

  beforeAll(async () => {
    ctx = await createTestApp();
    await seedPermissions(ctx.prisma);
    suffix = `sess${Date.now() % 100000}`;
  });

  afterAll(async () => ctx.close());

  const post = (url: string, body: unknown) =>
    request(ctx.app.getHttpServer()).post(url).send(body);

  async function register(id: string) {
    const response = await post('/auth/register', {
      email: `${id}@test.local`,
      username: id.slice(0, 20),
      password: 'motdepasse123',
      companyName: `Société ${id}`,
    }).expect(201);
    return response.body as { accessToken: string; refreshToken: string };
  }

  it('émet une paire de jetons à la connexion', async () => {
    const session = await register(`${suffix}a`);
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();

    await request(ctx.app.getHttpServer())
      .get('/partners')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .expect(200);
  });

  it('fait tourner le jeton de rafraîchissement à chaque échange', async () => {
    const session = await register(`${suffix}b`);
    const refreshed = await post('/auth/refresh', {
      refreshToken: session.refreshToken,
    }).expect(200);

    expect(refreshed.body.refreshToken).not.toBe(session.refreshToken);
    await request(ctx.app.getHttpServer())
      .get('/partners')
      .set('Authorization', `Bearer ${refreshed.body.accessToken}`)
      .expect(200);
  });

  it('ferme toutes les sessions quand un jeton déjà échangé est rejoué', async () => {
    const session = await register(`${suffix}c`);
    const rotated = (
      await post('/auth/refresh', {
        refreshToken: session.refreshToken,
      }).expect(200)
    ).body;

    // Rejeu de l'ancien jeton : signature d'un vol.
    const replay = await post('/auth/refresh', {
      refreshToken: session.refreshToken,
    }).expect(401);
    expect(replay.body.message).toMatch(/toutes les sessions ont été fermées/);

    // Le jeton courant ne vaut plus rien non plus.
    await post('/auth/refresh', { refreshToken: rotated.refreshToken }).expect(
      401,
    );
  });

  it('ne ferme que la session déconnectée, pas les autres', async () => {
    const id = `${suffix}d`;
    await register(id);

    const first = (
      await post('/auth/login', {
        email: `${id}@test.local`,
        password: 'motdepasse123',
      }).expect(200)
    ).body;
    const second = (
      await post('/auth/login', {
        email: `${id}@test.local`,
        password: 'motdepasse123',
      }).expect(200)
    ).body;

    await post('/auth/logout', { refreshToken: first.refreshToken }).expect(
      200,
    );

    const closed = await post('/auth/refresh', {
      refreshToken: first.refreshToken,
    }).expect(401);
    expect(closed.body.message).toMatch(/Session fermée/);

    // L'autre appareil reste connecté.
    await post('/auth/refresh', { refreshToken: second.refreshToken }).expect(
      200,
    );
  });

  it('refuse un jeton inconnu', async () => {
    await post('/auth/refresh', { refreshToken: 'jeton-inexistant' }).expect(
      401,
    );
  });

  it('ne stocke jamais le jeton en clair', async () => {
    const session = await register(`${suffix}e`);
    const stored = await ctx.prisma.refreshToken.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    expect(stored).toBeTruthy();
    expect(stored!.tokenHash).not.toBe(session.refreshToken);
    expect(stored!.tokenHash).toHaveLength(64); // SHA-256 en hexadécimal
  });
});
