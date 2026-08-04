export declare class CreatePropertyDto {
    title: string;
    description: string;
    price: number;
    type: string;
    beds: number;
    baths: number;
    city: string;
    area?: string;
    lat: number;
    lng: number;
    isRoommateAllowed?: boolean;
    roommatesCount?: number;
}
export declare class UpdatePropertyDto {
    title?: string;
    description?: string;
    price?: number;
    type?: string;
    beds?: number;
    baths?: number;
    city?: string;
    area?: string;
    lat?: number;
    lng?: number;
    mediaUrls?: string[];
    isRoommateAllowed?: boolean;
    roommatesCount?: number;
}
export declare class QueryPropertyDto {
    city?: string;
    type?: string;
    beds?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    ownerId?: string;
    isRoommateAllowed?: boolean;
}
export declare class UpdatePropertyStatusDto {
    status: string;
}
