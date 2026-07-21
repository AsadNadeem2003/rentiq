import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    private readonly jwtService;
    server: Server;
    constructor(prisma: PrismaService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(conversationId: string, client: Socket): Promise<{
        status: string;
        message: string;
        room?: undefined;
    } | {
        status: string;
        room: string;
        message?: undefined;
    }>;
    handleSendMessage(conversationId: string, text: string, client: Socket): Promise<{
        status: string;
        messageId: string;
    }>;
    handleBroadcastMessage(message: any, client: Socket): Promise<{
        status: string;
    } | undefined>;
}
