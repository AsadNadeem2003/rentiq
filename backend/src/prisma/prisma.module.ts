import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule is marked @Global() so that PrismaService is available
 * to every module in the app without needing to import PrismaModule
 * in each one. We register it once in AppModule and it's everywhere.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
