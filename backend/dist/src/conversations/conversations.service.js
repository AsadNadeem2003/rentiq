"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversationsService = class ConversationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrGetConversation(propertyId, buyerId) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found');
        }
        if (property.ownerId === buyerId) {
            throw new common_1.ForbiddenException('You cannot message yourself about your own property');
        }
        if (property.status && property.status !== 'AVAILABLE') {
            throw new common_1.ForbiddenException(`Messaging is disabled because this property is ${property.status.toLowerCase()}`);
        }
        const conversation = await this.prisma.conversation.upsert({
            where: {
                propertyId_buyerId_ownerId: {
                    propertyId,
                    buyerId,
                    ownerId: property.ownerId,
                },
            },
            update: {},
            create: {
                propertyId,
                buyerId,
                ownerId: property.ownerId,
            },
            include: {
                property: { select: { title: true, city: true, mediaUrls: true, status: true } },
                buyer: { select: { id: true, name: true } },
                owner: { select: { id: true, name: true } },
            },
        });
        return conversation;
    }
    async getUserConversations(userId) {
        return this.prisma.conversation.findMany({
            where: {
                OR: [{ buyerId: userId }, { ownerId: userId }],
            },
            include: {
                property: { select: { title: true, city: true, mediaUrls: true, status: true } },
                buyer: { select: { id: true, name: true } },
                owner: { select: { id: true, name: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(conversationId, userId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                property: { select: { title: true, price: true, status: true, ownerId: true, owner: { select: { name: true } } } },
                buyer: { select: { id: true, name: true } },
                owner: { select: { id: true, name: true } },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        return conversation;
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);
        return {
            data: messages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createMessage(conversationId, userId, text) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { property: { select: { status: true } } },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        if (conversation.property.status && conversation.property.status !== 'AVAILABLE') {
            throw new common_1.ForbiddenException(`Messaging is disabled because this property is ${conversation.property.status.toLowerCase()}`);
        }
        return this.prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                text,
            },
            include: {
                sender: {
                    select: { id: true, name: true },
                },
            },
        });
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map