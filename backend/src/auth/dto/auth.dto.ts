import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO for POST /auth/signup
 *
 * class-validator decorators automatically validate incoming request bodies.
 * If any field fails validation, NestJS returns a 400 Bad Request with
 * a descriptive error message — our controller code never even runs.
 */
export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}

/**
 * DTO for POST /auth/login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

/**
 * DTO for PATCH /auth/verify
 */
export class VerifyTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'CNIC number is required' })
  @Matches(/^[1-7][0-9]{4}-?[0-9]{7}-?[0-9]{1}$/, {
    message: 'Please provide a valid 13-digit Pakistani CNIC number (e.g. 35201-1234567-1)',
  })
  cnicNumber!: string;
}
