import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    ListingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
