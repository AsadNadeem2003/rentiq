import { PipeTransform } from '@nestjs/common';
export declare class MediaValidationPipe implements PipeTransform {
    transform(files: Express.Multer.File[]): Express.Multer.File[];
}
