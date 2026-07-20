import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

/**
 * AuthController — handles HTTP requests for authentication.
 *
 * Routes:
 *   POST /auth/signup → Creates a new user, returns JWT
 *   POST /auth/login  → Verifies credentials, returns JWT
 *
 * Both routes are PUBLIC (no AuthGuard) — users need to be able
 * to sign up and log in without already having a token.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Body: { email, password, name }
   * Returns: { accessToken: "eyJhbG..." }
   */
  @Post('signup')
  async signup(@Body() dto: SignupDto): Promise<{ accessToken: string }> {
    return this.authService.signup(dto);
  }

  /**
   * POST /auth/login
   * Body: { email, password }
   * Returns: { accessToken: "eyJhbG..." }
   *
   * @HttpCode(200) overrides the default 201 status for POST routes,
   * because login doesn't "create" a resource — it just authenticates.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }
}
