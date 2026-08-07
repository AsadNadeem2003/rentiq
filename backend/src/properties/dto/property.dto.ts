import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsInt,
  Min,
  Max,
  Length,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for POST /properties — creating a new property listing.
 */
export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100, { message: 'Title must be between 5 and 100 characters' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Length(15, 2000, { message: 'Description must be between 15 and 2000 characters' })
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Price must be at least PKR 1,000' })
  @Max(2000000000, { message: 'Price cannot exceed PKR 2 Billion (200 Crore)' })
  price!: number;

  @IsString()
  @IsIn(['RENT', 'SALE'], { message: 'Type must be either RENT or SALE' })
  type!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Bedrooms cannot be negative' })
  @Max(30, { message: 'Maximum 30 bedrooms allowed' })
  beds!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Bathrooms cannot be negative' })
  @Max(30, { message: 'Maximum 30 bathrooms allowed' })
  baths!: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 60, { message: 'City name must be between 2 and 60 characters' })
  city!: string;

  @IsOptional()
  @IsString()
  @Length(2, 60, { message: 'Area name must be between 2 and 60 characters' })
  area?: string;

  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRoommateAllowed?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  roommatesCount?: number;

  @IsOptional()
  media?: any;
}

/**
 * DTO for PATCH /properties/:id — updating an existing listing.
 */
export class UpdatePropertyDto {
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsString()
  @IsNotEmpty()
  @Length(5, 100, { message: 'Title must be between 5 and 100 characters' })
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsString()
  @IsNotEmpty()
  @Length(15, 2000, { message: 'Description must be between 15 and 2000 characters' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'Price must be at least PKR 1,000' })
  @Max(2000000000, { message: 'Price cannot exceed PKR 2 Billion (200 Crore)' })
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['RENT', 'SALE'], { message: 'Type must be either RENT or SALE' })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Bedrooms cannot be negative' })
  @Max(30, { message: 'Maximum 30 bedrooms allowed' })
  beds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Bathrooms cannot be negative' })
  @Max(30, { message: 'Maximum 30 bathrooms allowed' })
  baths?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 60, { message: 'City name must be between 2 and 60 characters' })
  city?: string;

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' || value === 'null' || value === 'undefined' ? undefined : value))
  @IsString()
  @Length(2, 60, { message: 'Area name must be between 2 and 60 characters' })
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value ? [value] : [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRoommateAllowed?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  roommatesCount?: number;

  @IsOptional()
  media?: any;
}

/**
 * Query parameters for GET /properties (feed with filters).
 * All are optional — no filters means "show everything."
 */
export class QueryPropertyDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @IsIn(['RENT', 'SALE'])
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  beds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRoommateAllowed?: boolean;
}

/**
 * DTO for PATCH /properties/:id/status
 */
export class UpdatePropertyStatusDto {
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'RENTED'])
  status!: string;
}
