import { ConversationsService } from './conversations.service';
export declare class CreateConversationDto {
    propertyId: string;
}
export declare class QueryMessagesDto {
    page?: number;
    limit?: number;
}
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(dto: CreateConversationDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    findAll(req: {
        user: {
            id: string;
        };
    }): Promise<({
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
    getMessages(id: string, query: QueryMessagesDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
