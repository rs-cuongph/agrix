import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeEmbedding } from './entities/knowledge-embedding.entity';
import { KnowledgeService } from './knowledge.service';
import { ChatbotService } from './chatbot.service';
import { AIController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeDocument, KnowledgeEmbedding]),
  ],
  controllers: [AIController],
  providers: [KnowledgeService, ChatbotService],
  exports: [KnowledgeService, ChatbotService],
})
export class AIModule {}
