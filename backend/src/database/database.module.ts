import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { User } from './entities/user.entity';
import { InitialSchema1731600000000 } from './migrations/1731600000000-InitialSchema';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = config.get<string>('NODE_ENV') === 'test';

        if (isTest) {
          return {
            type: 'sqljs' as const,
            autoSave: false,
            dropSchema: true,
            synchronize: true,
            entities: [User, Listing],
          };
        }

        const configuredPath =
          config.get<string>('DATABASE_PATH') ?? join('data', 'uniswap.sqlite');
        const databasePath = isAbsolute(configuredPath)
          ? configuredPath
          : join(process.cwd(), configuredPath);

        mkdirSync(dirname(databasePath), { recursive: true });

        return {
          type: 'sqljs' as const,
          location: databasePath,
          autoSave: true,
          synchronize: false,
          migrationsRun: true,
          entities: [User, Listing],
          migrations: [InitialSchema1731600000000],
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
