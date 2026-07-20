import { Controller, Post, Get, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;
}

export class QueryMessagesDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(
    @Body() dto: CreateConversationDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.conversationsService.createOrGetConversation(dto.propertyId, req.user.id);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.conversationsService.getUserConversations(req.user.id);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Query() query: QueryMessagesDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.conversationsService.getMessages(id, req.user.id, query.page, query.limit);
  }
}
