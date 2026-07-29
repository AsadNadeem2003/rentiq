import { PrismaService } from '../prisma/prisma.service';
export declare class ConversationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrGetConversation(propertyId: string, buyerId: string): Promise<{
        property: {
            title: string;
            status: string;
            city: string;
            mediaUrls: string[];
        };
        owner: {
            id: string;
            name: string;
        };
        buyer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        propertyId: string;
        buyerId: string;
    }>;
    getUserConversations(userId: string): Promise<({
        property: {
            title: string;
            status: string;
            city: string;
            mediaUrls: string[];
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
        buyer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        propertyId: string;
        buyerId: string;
    })[]>;
    findOne(conversationId: string, userId: string): Promise<{
        property: {
            title: string;
            price: number;
            status: string;
            ownerId: string;
            owner: {
                name: string;
            };
        };
        owner: {
            id: string;
            name: string;
        };
        buyer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        ownerId: string;
        createdAt: Date;
        propertyId: string;
        buyerId: string;
    }>;
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
    createMessage(conversationId: string, userId: string, text: string): Promise<{
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
    }>;
}
