import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthenticatedUser,
  toAuthenticatedUser,
} from './auth.types';
import { UniversityEmailService } from './university-email.service';

@Injectable()
export class AuthService {
  private readonly hashRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly universityEmails: UniversityEmailService,
    config: ConfigService,
  ) {
    const configuredRounds = Number(config.get<string>('BCRYPT_ROUNDS') ?? 12);
    this.hashRounds = Number.isInteger(configuredRounds)
      ? Math.min(Math.max(configuredRounds, 10), 14)
      : 12;
  }

  async register(input: RegisterDto): Promise<AuthenticatedUser> {
    const email = this.universityEmails.normalizeAndValidate(input.email);
    const existingUser = await this.users.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException(
        'An account with this university email already exists.',
      );
    }

    const user = this.users.create({
      name: input.name.trim(),
      email,
      passwordHash: await hash(input.password, this.hashRounds),
    });

    try {
      const savedUser = await this.users.save(user);
      return toAuthenticatedUser(savedUser);
    } catch (error: unknown) {
      // The database constraint is the final protection against two
      // simultaneous registrations that pass the lookup above.
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'An account with this university email already exists.',
        );
      }
      throw error;
    }
  }

  async login(input: LoginDto): Promise<AuthenticatedUser> {
    const email = this.universityEmails.normalize(input.email);

    if (!this.universityEmails.isAllowed(email)) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    const passwordMatches = user
      ? await compare(input.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    return toAuthenticatedUser(user);
  }

  async getById(id: string): Promise<AuthenticatedUser> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Your session is no longer valid.');
    }

    return toAuthenticatedUser(user);
  }
}
