import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { LISTING_CATEGORIES } from '../listing.constants';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateListingDto {
  @Transform(trim)
  @IsString({ message: 'Title is required.' })
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(120, { message: 'Title must be 120 characters or fewer.' })
  title: string;

  @Transform(trim)
  @IsString({ message: 'Description is required.' })
  @IsNotEmpty({ message: 'Description is required.' })
  @MaxLength(2000, { message: 'Description must be 2000 characters or fewer.' })
  description: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsIn([...LISTING_CATEGORIES], {
    message: `Category must be one of: ${LISTING_CATEGORIES.join(', ')}.`,
  })
  category: string;

  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === '') return true;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Free must be true or false.' })
  isFree: boolean;

  @ValidateIf((dto: CreateListingDto) => dto.isFree === false)
  @Transform(trim)
  @IsString({ message: 'Describe what you want in exchange.' })
  @IsNotEmpty({ message: 'Describe what you want in exchange.' })
  @MaxLength(200, { message: 'Exchange wish must be 200 characters or fewer.' })
  exchangeFor?: string;
}
