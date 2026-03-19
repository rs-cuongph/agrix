import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatbotService } from './chatbot.service';
import { KnowledgeService } from './knowledge.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AIController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  @Post('ask')
  async ask(@Body() body: { question: string; productId?: string }) {
    return this.chatbotService.ask(body.question, body.productId);
  }

  @Post('knowledge')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKnowledge(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    const textContent = file.buffer.toString('utf-8');
    return this.knowledgeService.uploadDocument(
      file.originalname,
      file.mimetype,
      textContent,
      req.user.id,
    );
  }

  @Get('knowledge')
  async listDocuments() {
    return this.knowledgeService.listDocuments();
  }
}
