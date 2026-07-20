import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // For development. Should restrict to frontend URL in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Handshake connection handler.
   * Extracts JWT token from the headers or query, verifies it,
   * and attaches the userId to the socket object.
   */
  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : (client.handshake.auth.token as string);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub; // Attach user ID
    } catch (error) {
      console.error('Socket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Join a specific conversation room.
   * Verifies that the user is actually a participant in the conversation.
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
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

  /**
   * Sends a message to a conversation room.
   * DB write MUST happen first. Broadcast happens only if write succeeds.
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody('conversationId') conversationId: string,
    @MessageBody('text') text: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    // 1. Verify membership
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.buyerId !== userId && conversation.ownerId !== userId)) {
      throw new WsException('Unauthorized to send messages in this conversation');
    }

    // 2. Write to DB FIRST (No history loss guarantee)
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

    // 3. Broadcast to everyone in the room (including sender to update their UI)
    this.server.to(`conversation:${conversationId}`).emit('newMessage', message);

    return { status: 'ok', messageId: message.id };
  }
}
