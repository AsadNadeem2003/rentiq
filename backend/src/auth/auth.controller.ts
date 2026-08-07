import { Body, Controller, Post, Patch, Get, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyTenantDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthController — handles HTTP requests for authentication and profile management.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto): Promise<{ accessToken: string }> {
    return this.authService.signup(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('verify')
  async verifyTenant(@Req() req: any, @Body() dto: VerifyTenantDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.authService.verifyTenant(userId, dto.cnicNumber);
  }
}
