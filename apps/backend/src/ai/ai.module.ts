import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeEmbedding } from './entities/knowledge-embedding.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatbotConfig } from './entities/chatbot-config.entity';
import { KnowledgeService } from './knowledge.service';
import { ChatbotService } from './chatbot.service';
import { ChatSessionService } from './chat-session.service';
import { ChatConfigService } from './chat-config.service';
import { AIController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeDocument,
      KnowledgeEmbedding,
      ChatSession,
      ChatMessage,
      ChatbotConfig,
    ]),
  ],
  controllers: [AIController],
  providers: [KnowledgeService, ChatbotService, ChatSessionService, ChatConfigService],
  exports: [KnowledgeService, ChatbotService, ChatSessionService, ChatConfigService],
})
export class AIModule {}
