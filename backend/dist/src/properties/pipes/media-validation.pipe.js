"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaValidationPipe = void 0;
const common_1 = require("@nestjs/common");
let MediaValidationPipe = class MediaValidationPipe {
    transform(files) {
        if (!files || files.length === 0) {
            return files;
        }
        let imageCount = 0;
        let videoCount = 0;
        for (const file of files) {
            if (file.mimetype.startsWith('image/')) {
                imageCount++;
                if (imageCount > 4) {
                    throw new common_1.BadRequestException('Maximum 4 images allowed');
                }
                if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                    throw new common_1.BadRequestException('Images must be JPEG or PNG');
                }
                if (file.size > 2 * 1024 * 1024) {
                    throw new common_1.BadRequestException(`Image ${file.originalname} size must be less than 2MB`);
                }
            }
            else if (file.mimetype.startsWith('video/')) {
                videoCount++;
                if (videoCount > 1) {
                    throw new common_1.BadRequestException('Maximum 1 video allowed');
                }
                if (file.mimetype !== 'video/mp4') {
                    throw new common_1.BadRequestException('Video must be MP4');
                }
                if (file.size > 5 * 1024 * 1024) {
                    throw new common_1.BadRequestException(`Video ${file.originalname} size must be less than 5MB`);
                }
            }
            else {
                throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}`);
            }
        }
        return files;
    }
};
exports.MediaValidationPipe = MediaValidationPipe;
exports.MediaValidationPipe = MediaValidationPipe = __decorate([
    (0, common_1.Injectable)()
], MediaValidationPipe);
//# sourceMappingURL=media-validation.pipe.js.map