import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function — starts the NestJS application.
 *
 * Key configurations:
 *
 * 1. ValidationPipe (global) — This is what makes our DTOs actually work.
 *    Without this, the @IsEmail(), @IsNotEmpty() decorators would be ignored.
 *    - whitelist: true → strips any fields not defined in the DTO (security)
 *    - forbidNonWhitelisted: true → throws an error if unknown fields are sent
 *    - transform: true → auto-converts types (e.g., string "42" → number 42)
 *
 * 2. CORS — Enabled so the Next.js frontend (different port) can call the API.
 *
 * 3. Port 3001 — Our backend runs on 3001, frontend will run on 3000.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation on all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS so the Next.js frontend can make API calls
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // API prefix: all routes become /api/auth/..., /api/properties/...
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log('🏠 Rentiq backend running on http://localhost:3001');
}

bootstrap();
