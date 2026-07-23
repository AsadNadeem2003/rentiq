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
    }): Promise<({
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
    findAll(req: {
        user: {
            id: string;
        };
    }): any;
    findOne(id: string, req: {
        user: {
            id: string;
        };
    }): any;
    getMessages(id: string, query: QueryMessagesDto, req: {
        user: {
            id: string;
        };
    }): any;
    createMessage(id: string, dto: CreateMessageDto, req: {
        user: {
            id: string;
        };
    }): any;
}
