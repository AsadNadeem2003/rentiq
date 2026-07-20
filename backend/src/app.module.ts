import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ChatModule } from './chat/chat.module';

import { AppController } from './app.controller';

/**
 * AppModule — the root module that ties the entire application together.
 *
 * ConfigModule.forRoot({ isGlobal: true }) loads .env variables and
 * makes ConfigService available everywhere without re-importing.
 *
 * Module import order doesn't matter for functionality, but it's
 * listed logically: config → database → auth → features.
 */
@Module({
  imports: [
    // Load .env file and make ConfigService globally available
    ConfigModule.forRoot({ isGlobal: true }),
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
})
export class AppModule {}
