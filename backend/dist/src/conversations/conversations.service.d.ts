import { PrismaService } from '../prisma/prisma.service';
export declare class ConversationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrGetConversation(propertyId: string, buyerId: string): Promise<{
        property: {
            title: string;
            city: string;
            mediaUrls: string[];
        };
        owner: {
            name: string;
            id: string;
        };
        buyer: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerId: string;
        propertyId: string;
        buyerId: string;
    }>;
    getUserConversations(userId: string): Promise<({
        property: {
            title: string;
            city: string;
            mediaUrls: string[];
        };
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
        }[];
        owner: {
            name: string;
            id: string;
        };
        buyer: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerId: string;
        propertyId: string;
        buyerId: string;
    })[]>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            conversationId: string;
            senderId: string;
            text: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
