import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ChatModule } from './chat/chat.module';
import { CryptoModule } from './crypto/crypto.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    // Load .env file and make ConfigService globally available
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate Limiting & Throttling (30 requests per minute default)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    // AES-256-GCM encryption for message text (globally available)
    CryptoModule,
    // Database connection (globally available)
    PrismaModule,
    // Authentication (signup, login, JWT)
    AuthModule,
    // Property listings CRUD
    PropertiesModule,
    // Conversations and messages
    ConversationsModule,
    // Real-time Chat Gateway
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
