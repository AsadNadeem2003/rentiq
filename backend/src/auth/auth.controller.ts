import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyTenantDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(res: any, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.signup(dto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(refreshToken, { secret });
      const userId = payload.sub;

      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      this.setRefreshTokenCookie(res, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    } catch {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    if (userId) {
      await this.authService.logout(userId);
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('verify')
  async verifyTenant(@Req() req: any, @Body() dto: VerifyTenantDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.authService.verifyTenant(userId, dto.cnicNumber);
  }
}
