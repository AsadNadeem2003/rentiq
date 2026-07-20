import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertyDto,
} from './dto/property.dto';

/**
 * PropertiesService — all database operations for property listings.
 *
 * Key design decisions:
 * - findAll() supports pagination + filtering (city, type, beds, price range)
 * - create() links the property to the logged-in user via ownerId
 * - update() and remove() enforce owner-only access at the service level,
 *   not just in the UI — this is a spec requirement (Section 6)
 */
@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /properties — paginated feed with optional filters.
   *
   * Prisma's `where` clause is built dynamically: we only add filter
   * conditions for fields that the caller actually provided. This means
   * "GET /properties" returns everything, while
   * "GET /properties?city=Lahore&type=RENT" returns only Lahore rentals.
   */
  async findAll(query: QueryPropertyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    // Build the Prisma "where" filter dynamically
    const where: Record<string, unknown> = {};

    if (query.city) {
      where.city = { equals: query.city, mode: 'insensitive' };
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
        (where.price as Record<string, number>).gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = query.maxPrice;
      }
    }

    // Run both queries in parallel for performance
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

  /**
   * GET /properties/:id — single property detail with owner info.
   */
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  /**
   * POST /properties — create a new listing.
   */
  async create(dto: CreatePropertyDto, ownerId: string, mediaUrls: string[] = []) {
    return this.prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: Number(dto.price), // Convert string fields to number if they came from FormData
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

  /**
   * PATCH /properties/:id — owner-only edit.
   *
   * Enforces ownership check at the service level:
   * even if someone crafts a PATCH request with the right ID,
   * they can't edit someone else's listing.
   */
  async update(id: string, dto: UpdatePropertyDto, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own properties');
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

  /**
   * DELETE /properties/:id — owner-only delete.
   *
   * Same ownership check as update().
   */
  async remove(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.prisma.property.delete({ where: { id } });

    return { message: 'Property deleted successfully' };
  }
}
