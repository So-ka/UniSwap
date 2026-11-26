import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('listing details (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a listing with its owner name and posting date', async () => {
    const authenticated = request.agent(app.getHttpServer());

    await authenticated
      .post('/api/auth/register')
      .send({
        name: 'Grace Student',
        email: 'grace@unibz.it',
        password: 'correct-horse',
      })
      .expect(201);

    const created = await authenticated
      .post('/api/listings')
      .field('title', 'Statistics textbook')
      .field('description', 'Good condition, third edition.')
      .field('category', 'textbooks')
      .field('isFree', 'true')
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/listings/${created.body.listing.id}`)
      .expect(200);

    expect(response.body.listing).toMatchObject({
      id: created.body.listing.id,
      title: 'Statistics textbook',
      description: 'Good condition, third edition.',
      category: 'textbooks',
      isFree: true,
      status: 'AVAILABLE',
      ownerName: 'Grace Student',
    });
    expect(response.body.listing.createdAt).toBeTruthy();
  });

  it('returns a clear 404 when the listing does not exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/listings/00000000-0000-4000-8000-000000000000')
      .expect(404);

    expect(response.body.message).toBe('Listing not found.');
  });
});
