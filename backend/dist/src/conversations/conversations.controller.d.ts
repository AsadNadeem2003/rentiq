import { ConversationsService } from './conversations.service';
export declare class CreateConversationDto {
    propertyId: string;
}
export declare class QueryMessagesDto {
    page?: number;
    limit?: number;
}
export declare class CreateMessageDto {
    text: string;
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
            city: string;
            title: string;
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
            city: string;
            title: string;
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
            id: string;
            name: string;
        };
        buyer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerId: string;
        propertyId: string;
        buyerId: string;
    })[]>;
    findOne(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        property: {
            ownerId: string;
            price: number;
            title: string;
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
        createdAt: Date;
        ownerId: string;
        propertyId: string;
        buyerId: string;
    }>;
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
    createMessage(id: string, dto: CreateMessageDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
