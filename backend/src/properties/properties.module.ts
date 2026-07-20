import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { SupabaseService } from './supabase.service';

/**
 * PropertiesModule bundles the properties controller and service.
 *
 * Note: PrismaService is NOT imported here because PrismaModule
 * is marked @Global() — it's automatically available everywhere.
 */
@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, SupabaseService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
