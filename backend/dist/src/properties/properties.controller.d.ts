import { PropertiesService } from './properties.service';
import { SupabaseService } from './supabase.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto/property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    private readonly supabaseService;
    constructor(propertiesService: PropertiesService, supabaseService: SupabaseService);
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
    create(dto: CreatePropertyDto, req: {
        user: {
            id: string;
        };
    }, files: Express.Multer.File[]): Promise<{
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
    update(id: string, dto: UpdatePropertyDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    remove(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        message: string;
    }>;
}
