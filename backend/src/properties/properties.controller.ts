import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { SupabaseService } from './supabase.service';
import { MediaValidationPipe } from './pipes/media-validation.pipe';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertyDto,
} from './dto/property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * PropertiesController — HTTP routes for property listings.
 */
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  /**
   * POST /properties
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('media', 5))
  async create(
    @Body() dto: CreatePropertyDto,
    @Request() req: { user: { id: string } },
    @UploadedFiles(MediaValidationPipe) files: Express.Multer.File[],
  ) {
    // 1. Upload all valid files to Supabase and collect their URLs
    const mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => this.supabaseService.uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      mediaUrls.push(...urls);
    }

    // 2. Delegate to the service, now passing the real mediaUrls
    return this.propertiesService.create(dto, req.user.id, mediaUrls);
  }

  /**
   * PATCH /properties/:id
   * Body: any subset of CreatePropertyDto fields
   *
   * The service layer verifies the caller is the property owner.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.propertiesService.update(id, dto, req.user.id);
  }

  /**
   * DELETE /properties/:id
   *
   * The service layer verifies the caller is the property owner.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.propertiesService.remove(id, req.user.id);
  }
}
