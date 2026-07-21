import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsInt,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for POST /properties — creating a new property listing.
 *
 * The @Type(() => Number) decorator is needed because form-data
 * sends everything as strings. class-transformer converts them
 * to the correct types before validation runs.
 */
export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsIn(['RENT', 'SALE'], { message: 'Type must be either RENT or SALE' })
  type!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  beds!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  baths!: number;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  area?: string;

  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

/**
 * DTO for PATCH /properties/:id — updating an existing listing.
 * All fields are optional since it's a partial update.
 */
export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['RENT', 'SALE'], { message: 'Type must be either RENT or SALE' })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  beds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  baths?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
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
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
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
}

/**
 * DTO for PATCH /properties/:id/status
 */
export class UpdatePropertyStatusDto {
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'RENTED'])
  status!: string;
}
