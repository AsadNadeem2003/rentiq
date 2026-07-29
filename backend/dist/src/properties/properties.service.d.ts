import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto/property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryPropertyDto): Promise<{
        data: ({
            owner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            title: string;
            description: string;
            price: number;
            type: string;
            status: string;
            beds: number;
            baths: number;
            city: string;
            area: string | null;
            lat: number;
            lng: number;
            mediaUrls: string[];
            ownerId: string;
            createdAt: Date;
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
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        status: string;
        beds: number;
        baths: number;
        city: string;
        area: string | null;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
        createdAt: Date;
    }>;
    create(dto: CreatePropertyDto, ownerId: string, mediaUrls?: string[]): Promise<{
        owner: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        status: string;
        beds: number;
        baths: number;
        city: string;
        area: string | null;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdatePropertyDto, userId: string): Promise<{
        owner: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        status: string;
        beds: number;
        baths: number;
        city: string;
        area: string | null;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
        createdAt: Date;
    }>;
    updateStatus(id: string, status: string, userId: string): Promise<{
        owner: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        status: string;
        beds: number;
        baths: number;
        city: string;
        area: string | null;
        lat: number;
        lng: number;
        mediaUrls: string[];
        ownerId: string;
        createdAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
