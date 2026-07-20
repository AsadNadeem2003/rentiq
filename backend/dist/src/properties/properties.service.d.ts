import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto/property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryPropertyDto): Promise<{
        data: ({
            owner: {
                email: string;
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            title: string;
            description: string;
            price: number;
            type: string;
            beds: number;
            baths: number;
            city: string;
            lat: number;
            lng: number;
            mediaUrls: string[];
            ownerId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        owner: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        price: number;
        type: string;
        beds: number;
        baths: number;
        city: string;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
    }>;
    create(dto: CreatePropertyDto, ownerId: string, mediaUrls?: string[]): Promise<{
        owner: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        price: number;
        type: string;
        beds: number;
        baths: number;
        city: string;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
    }>;
    update(id: string, dto: UpdatePropertyDto, userId: string): Promise<{
        owner: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        price: number;
        type: string;
        beds: number;
        baths: number;
        city: string;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
