import { PrismaService } from '../prisma/prisma.service';
export declare class ConversationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrGetConversation(propertyId: string, buyerId: string): Promise<({
        property: {
            title: string;
            status: string;
            city: string;
            mediaUrls: string[];
        };
        buyer: {
            id: string;
            name: string;
        };
        owner: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        propertyId: string;
        buyerId: string;
        ownerId: string;
        createdAt: Date;
    }) | ({
        property: {
            title: string;
            status: string;
            city: string;
            mediaUrls: string[];
        };
        buyer: {
            id: string;
            name: string;
        };
        owner: {
            id: string;
            name: string;
        };
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
        }[];
    } & {
        id: string;
        propertyId: string;
        buyerId: string;
        ownerId: string;
        createdAt: Date;
    })[] | ({
        property: {
            ownerId: string;
            owner: {
                name: string;
            };
            title: string;
            price: number;
            status: string;
        };
        buyer: {
            id: string;
            name: string;
        };
        owner: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        propertyId: string;
        buyerId: string;
        ownerId: string;
        createdAt: Date;
    }) | ({
        sender: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        text: string;
    }) | {
        data: {
            id: string;
            createdAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
        }[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    } | null>;
}
