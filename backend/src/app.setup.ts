import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import helmet from 'helmet';

const DEFAULT_SESSION_SECRET = 'uniswap-local-development-only';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const sessionSecret =
    config.get<string>('SESSION_SECRET') ?? DEFAULT_SESSION_SECRET;

  if (isProduction && sessionSecret === DEFAULT_SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be configured in production.');
  }

  const allowedOrigins = (
    config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const secureCookie = config.get<string>('COOKIE_SECURE') === 'true';

  if (secureCookie) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.use(
    session({
      name: 'uniswap.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: secureCookie ? 'none' : 'lax',
        secure: secureCookie,
        maxAge: Number(config.get<string>('SESSION_MAX_AGE_MS') ?? 86_400_000),
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
