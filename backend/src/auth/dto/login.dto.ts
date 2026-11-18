import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254, { message: 'Email must be 254 characters or fewer.' })
  email: string;

  @IsString({ message: 'Password is required.' })
  @MinLength(1, { message: 'Password is required.' })
  @MaxLength(72, { message: 'Password must be 72 characters or fewer.' })
  password: string;
}
