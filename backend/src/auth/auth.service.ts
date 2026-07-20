import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

/**
 * AuthService handles the core authentication logic:
 *
 * 1. signup() — Hash password → create user → return JWT
 * 2. login()  — Find user → compare hash → return JWT
 *
 * Passwords are NEVER stored in plain text. bcrypt adds a random "salt"
 * to each password before hashing, so even identical passwords produce
 * different hashes. The salt rounds (10) determine computation cost —
 * higher = slower but more secure against brute force.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string }> {
    // Check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password — 10 salt rounds is the industry standard balance
    // of security vs. performance
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user row in Postgres
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    // Generate and return a JWT
    return this.generateToken(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare the provided password against the stored hash
    // bcrypt.compare() handles the salt extraction internally
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateToken(user.id, user.email);
  }

  /**
   * Generates a signed JWT token.
   *
   * The payload contains:
   * - sub: user ID (standard JWT "subject" claim)
   * - email: for convenience in the frontend
   *
   * The token is signed with JWT_SECRET from .env and expires
   * based on JWT_EXPIRES_IN (default: 7 days).
   */
  private generateToken(
    userId: string,
    email: string,
  ): { accessToken: string } {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
