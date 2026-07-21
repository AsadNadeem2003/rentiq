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
   * Also joins the user to their personal notification room.
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

      // Auto-join the user to their personal notification room
      await client.join(`user:${payload.sub}`);
      console.log(`User ${payload.sub} connected and joined personal room`);
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
      include: {
        property: { select: { title: true } },
      },
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

    // 4. Send notification to the OTHER participant's personal room
    const recipientId = conversation.buyerId === userId ? conversation.ownerId : conversation.buyerId;
    this.server.to(`user:${recipientId}`).emit('notification', {
      type: 'new_message',
      conversationId,
      senderName: message.sender.name,
      propertyTitle: conversation.property.title,
      text: message.text,
      createdAt: message.createdAt,
    });

    return { status: 'ok', messageId: message.id };
  }

  /**
   * Broadcasts an already-saved message to a conversation room
   * and sends a notification to the other participant.
   */
  @SubscribeMessage('broadcastMessage')
  async handleBroadcastMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!message || !message.conversationId) return;

    // 1. Verify membership and get property info
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: message.conversationId },
      include: {
        property: { select: { title: true } },
      },
    });

    if (!conversation || (conversation.buyerId !== userId && conversation.ownerId !== userId)) {
      throw new WsException('Unauthorized to broadcast in this conversation');
    }

    // 2. Broadcast to everyone else in the conversation room
    client.broadcast.to(`conversation:${message.conversationId}`).emit('newMessage', message);

    // 3. Send notification to the OTHER participant's personal room
    const recipientId = conversation.buyerId === userId ? conversation.ownerId : conversation.buyerId;
    const senderName = message.sender?.name || 'Someone';
    this.server.to(`user:${recipientId}`).emit('notification', {
      type: 'new_message',
      conversationId: message.conversationId,
      senderName,
      propertyTitle: conversation.property.title,
      text: message.text,
      createdAt: message.createdAt,
    });

    return { status: 'ok' };
  }
}
