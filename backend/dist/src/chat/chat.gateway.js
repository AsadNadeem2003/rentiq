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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let ChatGateway = class ChatGateway {
    prisma;
    jwtService;
    server;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const authHeader = client.handshake.headers.authorization;
            const token = authHeader ? authHeader.split(' ')[1] : client.handshake.auth.token;
            if (!token) {
                throw new websockets_1.WsException('Unauthorized');
            }
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
        }
        catch (error) {
            console.error('Socket authentication failed:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinRoom(conversationId, client) {
        const userId = client.data.userId;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            return { status: 'error', message: 'Conversation not found' };
        }
        if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
            return { status: 'error', message: 'Unauthorized access to room' };
        }
        const roomName = `conversation:${conversationId}`;
        await client.join(roomName);
        return { status: 'ok', room: roomName };
    }
    async handleSendMessage(conversationId, text, client) {
        const userId = client.data.userId;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation || (conversation.buyerId !== userId && conversation.ownerId !== userId)) {
            throw new websockets_1.WsException('Unauthorized to send messages in this conversation');
        }
        const message = await this.prisma.message.create({
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
        this.server.to(`conversation:${conversationId}`).emit('newMessage', message);
        return { status: 'ok', messageId: message.id };
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)('conversationId')),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)('conversationId')),
    __param(1, (0, websockets_1.MessageBody)('text')),
    __param(2, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map