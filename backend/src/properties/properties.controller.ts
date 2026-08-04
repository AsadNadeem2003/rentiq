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
  UpdatePropertyStatusDto,
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
      const uploadPromises = files.map((file) =>
        this.supabaseService.uploadFile(file),
      );
      const urls = await Promise.all(uploadPromises);
      mediaUrls.push(...urls);
    }

    // 2. Delegate to the service, now passing the real mediaUrls
    const userId = req.user?.id || (req.user as any)?.userId;
    return this.propertiesService.create(dto, userId, mediaUrls);
  }

  /**
   * PATCH /properties/:id
   * Body: any subset of CreatePropertyDto fields
   *
   * The service layer verifies the caller is the property owner.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('media', 5))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @Request() req: any,
    @UploadedFiles(MediaValidationPipe) files?: Express.Multer.File[],
  ) {
    const userId = req.user?.id || req.user?.userId;

    // 1. Upload newly selected files to Supabase if any
    const newMediaUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.supabaseService.uploadFile(file),
      );
      const urls = await Promise.all(uploadPromises);
      newMediaUrls.push(...urls);
    }

    // 2. Parse retained existing mediaUrls if sent via FormData
    let existingUrls: string[] = [];
    if (dto.mediaUrls) {
      if (typeof dto.mediaUrls === 'string') {
        try {
          existingUrls = JSON.parse(dto.mediaUrls);
        } catch {
          existingUrls = [dto.mediaUrls];
        }
      } else if (Array.isArray(dto.mediaUrls)) {
        existingUrls = dto.mediaUrls;
      }
    }

    const finalMediaUrls = [...existingUrls, ...newMediaUrls];

    const updateData = {
      ...dto,
      ...(files?.length || dto.mediaUrls !== undefined ? { mediaUrls: finalMediaUrls } : {}),
    };

    return this.propertiesService.update(id, updateData, userId);
  }

  /**
   * PATCH /properties/:id/status
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.propertiesService.updateStatus(id, dto.status, userId);
  }

  /**
   * DELETE /properties/:id
   *
   * The service layer verifies the caller is the property owner.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.propertiesService.remove(id, userId);
  }
}
