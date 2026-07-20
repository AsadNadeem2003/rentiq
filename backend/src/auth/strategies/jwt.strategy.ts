import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JwtPayload is the data we encode into each JWT when a user logs in.
 * When we verify a token later, we get this payload back.
 */
export interface JwtPayload {
  sub: string; // User ID (standard JWT claim name for "subject")
  email: string;
}

/**
 * JwtStrategy extends Passport's Strategy class.
 *
 * How it works:
 * 1. A request comes in with header "Authorization: Bearer <token>"
 * 2. ExtractJwt.fromAuthHeaderAsBearerToken() pulls the token out
 * 3. Passport verifies the token's signature using JWT_SECRET
 * 4. If valid, it calls our validate() method with the decoded payload
 * 5. Whatever validate() returns gets attached to req.user
 *
 * If the token is missing, expired, or tampered with → automatic 401.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Called after the JWT is verified. We look up the user in the database
   * to make sure they still exist (e.g., haven't been deleted since the
   * token was issued). The returned object becomes req.user.
   */
  async validate(payload: JwtPayload): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return { id: user.id, email: user.email };
  }
}
