import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or fetch a conversation.
   * Derives ownerId from the property.
   * Blocks self-messaging if property.ownerId === buyerId.
   */
  async createOrGetConversation(propertyId: string, buyerId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.ownerId === buyerId) {
      throw new ForbiddenException('You cannot message yourself about your own property');
    }

    if (property.status && property.status !== 'AVAILABLE') {
      throw new ForbiddenException(`Messaging is disabled because this property is ${property.status.toLowerCase()}`);
    }

    // Upsert conversation to prevent duplicates based on the @@unique constraint
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

  /**
   * Get all conversations where the user is either the buyer or the owner.
   */
  async getUserConversations(userId: string) {
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
          take: 1, // Include the latest message for the inbox preview
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch a single conversation.
   */
  async findOne(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        property: { select: { title: true, price: true, status: true, ownerId: true, owner: { select: { name: true } } } },
        buyer: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }

  /**
   * Fetch messages for a conversation, ensuring the user is a participant.
   */
  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // Older messages first
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

  /**
   * Create a message via REST endpoint
   */
  async createMessage(conversationId: string, userId: string, text: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { property: { select: { status: true } } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.buyerId !== userId && conversation.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    if (conversation.property.status && conversation.property.status !== 'AVAILABLE') {
      throw new ForbiddenException(`Messaging is disabled because this property is ${conversation.property.status.toLowerCase()}`);
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
}
