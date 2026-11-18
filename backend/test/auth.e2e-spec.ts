import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { compare } from 'bcryptjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { User } from '../src/database/entities/user.entity';

describe('authentication (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.UNIVERSITY_EMAIL_DOMAIN = 'unibz.it';
    process.env.SESSION_SECRET = 'test-secret-that-is-not-used-in-production';
    process.env.BCRYPT_ROUNDS = '10';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  const registration = (email: string) => ({
    name: 'Ada Student',
    email,
    password: 'correct-horse',
  });

  it('registers a university user and stores only a password hash', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registration('ada@unibz.it'))
      .expect(201);

    expect(response.body.user).toMatchObject({
      name: 'Ada Student',
      email: 'ada@unibz.it',
    });
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');

    const storedUser = await dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: 'ada@unibz.it' })
      .getOneOrFail();

    expect(storedUser.passwordHash).not.toBe('correct-horse');
    await expect(compare('correct-horse', storedUser.passwordHash)).resolves.toBe(
      true,
    );
  });

  it('rejects an address outside the configured university domain', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registration('student@gmail.com'))
      .expect(400);

    expect(response.body.message).toBe(
      'Use a university email ending in @unibz.it.',
    );
  });

  it('rejects an email address that is already registered', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registration('duplicate@unibz.it'))
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registration('DUPLICATE@unibz.it'))
      .expect(409);

    expect(response.body.message).toBe(
      'An account with this university email already exists.',
    );
  });

  it('accepts correct credentials and rejects incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registration('login@unibz.it'))
      .expect(201);

    const authenticated = request.agent(app.getHttpServer());
    await authenticated
      .post('/api/auth/login')
      .send({ email: 'login@unibz.it', password: 'correct-horse' })
      .expect(200);
    await authenticated.get('/api/auth/me').expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@unibz.it', password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toBe('Incorrect email or password.');
  });

  it('destroys the current session on logout', async () => {
    const authenticated = request.agent(app.getHttpServer());

    await authenticated
      .post('/api/auth/register')
      .send(registration('logout@unibz.it'))
      .expect(201);
    await authenticated.get('/api/auth/me').expect(200);
    await authenticated.post('/api/auth/logout').expect(204);

    const response = await authenticated.get('/api/auth/me').expect(401);
    expect(response.body.message).toBe('Log in to continue.');
  });
});
