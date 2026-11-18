import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UniversityEmailService {
  readonly domain: string;

  constructor(config: ConfigService) {
    this.domain = (config.get<string>('UNIVERSITY_EMAIL_DOMAIN') ?? 'unibz.it')
      .trim()
      .replace(/^@/, '')
      .toLowerCase();
  }

  normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  normalizeAndValidate(email: string): string {
    const normalizedEmail = this.normalize(email);

    if (!this.isAllowed(normalizedEmail)) {
      throw new BadRequestException(
        `Use a university email ending in @${this.domain}.`,
      );
    }

    return normalizedEmail;
  }

  isAllowed(email: string): boolean {
    const parts = this.normalize(email).split('@');
    return parts.length === 2 && parts[0].length > 0 && parts[1] === this.domain;
  }
}
