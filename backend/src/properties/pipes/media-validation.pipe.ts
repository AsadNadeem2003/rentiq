import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MediaValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return files;
    }

    let imageCount = 0;
    let videoCount = 0;

    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        imageCount++;
        if (imageCount > 4) {
          throw new BadRequestException('Maximum 4 images allowed');
        }
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          throw new BadRequestException('Images must be JPEG or PNG');
        }
        if (file.size > 2 * 1024 * 1024) {
          throw new BadRequestException(`Image ${file.originalname} size must be less than 2MB`);
        }
      } else if (file.mimetype.startsWith('video/')) {
        videoCount++;
        if (videoCount > 1) {
          throw new BadRequestException('Maximum 1 video allowed');
        }
        if (file.mimetype !== 'video/mp4') {
          throw new BadRequestException('Video must be MP4');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new BadRequestException(`Video ${file.originalname} size must be less than 5MB`);
        }
      } else {
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
      }
    }

    return files;
  }
}
