import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard activates the 'jwt' Passport strategy.
 *
 * Usage: Put @UseGuards(JwtAuthGuard) on any controller or route
 * to require a valid JWT token. If the token is missing or invalid,
 * NestJS automatically returns a 401 Unauthorized response.
 *
 * Example:
 *   @UseGuards(JwtAuthGuard)
 *   @Post('properties')
 *   create(@Request() req) {
 *     // req.user is guaranteed to exist here
 *     const userId = req.user.id;
 *   }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
