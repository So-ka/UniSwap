import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListListingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be a whole number.' })
  @Min(1, { message: 'Page must be 1 or higher.' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'Page size must be at least 1.' })
  @Max(50, { message: 'Page size must be 50 or fewer.' })
  pageSize: number = 12;
}
