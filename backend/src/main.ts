import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as dns from 'dns';

// Local dev IPv4 fix — disabled in production to avoid conflicting with cloud platform DNS
if (process.env.NODE_ENV !== 'production') {
  dns.setDefaultResultOrder('ipv4first');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet Security Headers — protects against Clickjacking, XSS, MIME sniffing
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // 2. Cookie Parser — enables reading HttpOnly cookies for Refresh Tokens
  app.use(cookieParser());

  // 3. Enforce HTTPS in production (redirect http to https)
  if (process.env.NODE_ENV === 'production') {
    app.use((req: any, res: any, next: any) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

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
      const status = exception?.getStatus ? exception.getStatus() : 500;
      if (status >= 500) {
        console.error('CRITICAL BACKEND ERROR:', exception);
      }
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

  // API prefix: all routes become /api/auth/..., /api/properties/... (except root / for health checks)
  app.setGlobalPrefix('api', { exclude: ['/'] });

  // 2. Swagger Production Guard — expose API docs route in dev OR when ENABLE_SWAGGER=true
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
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
