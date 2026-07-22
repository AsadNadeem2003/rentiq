"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.ownerId) {
            where.ownerId = query.ownerId;
        }
        if (query.city) {
            where.city = { contains: query.city, mode: 'insensitive' };
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.beds !== undefined) {
            where.beds = { gte: query.beds };
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) {
                where.price.gte = query.minPrice;
            }
            if (query.maxPrice !== undefined) {
                where.price.lte = query.maxPrice;
            }
        }
        const [properties, total] = await Promise.all([
            this.prisma.property.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
            this.prisma.property.count({ where }),
        ]);
        return {
            data: properties,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        return property;
    }
    async create(dto, ownerId, mediaUrls = []) {
        return this.prisma.property.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: Number(dto.price),
                type: dto.type,
                beds: Number(dto.beds),
                baths: Number(dto.baths),
                city: dto.city,
                lat: Number(dto.lat),
                lng: Number(dto.lng),
                mediaUrls,
                ownerId,
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async update(id, dto, userId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (property.ownerId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own properties');
        }
        return this.prisma.property.update({
            where: { id },
            data: dto,
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async updateStatus(id, status, userId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (property.ownerId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own properties');
        }
        return this.prisma.property.update({
            where: { id },
            data: { status },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async remove(id, userId) {
        const property = await this.prisma.property.findUnique({
            where: { id },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (property.ownerId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own properties');
        }
        await this.prisma.property.delete({ where: { id } });
        return { message: 'Property deleted successfully' };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map