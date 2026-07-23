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
    }) | ({
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
    })[] | ({
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
