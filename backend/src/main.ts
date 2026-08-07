import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet Security Headers — protects against Clickjacking, XSS, MIME sniffing
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Enable global validation on all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters({
    catch(exception: any, host: any) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      console.error('CRITICAL BACKEND ERROR:', exception);
      const status = exception?.getStatus ? exception.getStatus() : 500;
      const message =
        exception?.response || exception?.message || 'Internal server error';
      response
        .status(status)
        .json(
          typeof message === 'object'
            ? message
            : { statusCode: status, message },
        );
    },
  });

  // Enable CORS so the Next.js frontend can make API calls
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // API prefix: all routes become /api/auth/..., /api/properties/...
  app.setGlobalPrefix('api');

  // 2. Swagger Production Guard — only expose API docs route in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Rentiq (KirayaPad) API')
      .setDescription(
        'The Rentiq API documentation for properties, users, and chat.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(3001);
  console.log('🏠 Rentiq backend running on http://localhost:3001');
}

bootstrap();
