import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { ChatbotService } from './chatbot.service';
import { KnowledgeService } from './knowledge.service';
import { ChatSessionService } from './chat-session.service';
import { ChatConfigService } from './chat-config.service';
import { AskDto } from './dto/ask.dto';
import { UpdateConfigDto } from './dto/config.dto';

@Controller('ai')
export class AIController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly knowledgeService: KnowledgeService,
    private readonly sessionService: ChatSessionService,
    private readonly configService: ChatConfigService,
  ) {}

  // ===================== PUBLIC ENDPOINTS =====================

  /**
   * Public chat endpoint with SSE streaming (no auth required).
   */
  @Post('public/chat')
  async publicChat(
    @Body() body: AskDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    // Check if chatbot is enabled
    const config = await this.configService.getConfig();
    if (!config.enabled) {
      throw new HttpException('Chatbot đang tạm ngừng hoạt động.', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    // Get or create session
    const session = await this.sessionService.getOrCreateSession(
      body.sessionId,
      body.productId,
      undefined, // productContext will be loaded if productId provided
      ipAddress,
    );

    // Add user message
    await this.sessionService.addUserMessage(session.id, body.question, ipAddress);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Stream response
    let fullAnswer = '';
    let sources: any[] = [];

    try {
      for await (const chunk of this.chatbotService.streamAnswer(
        body.question,
        session.productContext,
      )) {
        if (chunk.type === 'token') {
          fullAnswer += chunk.data;
          res.write(`event: token\ndata: ${JSON.stringify({ token: chunk.data })}\n\n`);
        } else if (chunk.type === 'done') {
          try {
            const parsed = JSON.parse(chunk.data);
            sources = parsed.sources || [];
          } catch {}
          res.write(`event: done\ndata: ${JSON.stringify({ sessionId: session.id, sources })}\n\n`);
        }
      }
    } catch (error: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    }

    // Save assistant message
    if (fullAnswer) {
      await this.sessionService.addAssistantMessage(session.id, fullAnswer, sources);
    }

    res.end();
  }

  // ===================== ADMIN ENDPOINTS =====================

  /**
   * Admin: Ask chatbot (non-streaming, for testing).
   */
  @Post('ask')
  @UseGuards(AuthGuard('jwt'))
  async ask(@Body() body: AskDto) {
    return this.chatbotService.ask(body.question, body.productId);
  }

  // --- Knowledge Management ---

  @Get('admin/knowledge')
  @UseGuards(AuthGuard('jwt'))
  async listDocuments() {
    return this.knowledgeService.listDocuments();
  }

  @Post('admin/knowledge')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadKnowledge(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File quá lớn. Giới hạn 10MB.');
    }

    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ file PDF, DOCX, hoặc TXT.');
    }

    return this.knowledgeService.uploadDocument(
      file.originalname,
      file.mimetype,
      file.buffer,
      req.user.id,
      file.size,
    );
  }

  @Delete('admin/knowledge/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteDocument(@Param('id') id: string) {
    await this.knowledgeService.deleteDocument(id);
    return { message: 'Đã xóa tài liệu' };
  }

  // --- Product Sync ---

  @Post('admin/sync-products')
  @UseGuards(AuthGuard('jwt'))
  async syncProducts() {
    return this.knowledgeService.syncProducts();
  }

  // --- Config ---

  @Get('admin/config')
  @UseGuards(AuthGuard('jwt'))
  async getConfig() {
    return this.configService.getConfigForAdmin();
  }

  @Put('admin/config')
  @UseGuards(AuthGuard('jwt'))
  async updateConfig(@Body() body: UpdateConfigDto) {
    // Validate API keys if provided
    if (body.primaryApiKey && body.primaryProvider) {
      const validation = await this.configService.validateApiKey(body.primaryProvider, body.primaryApiKey);
      if (!validation.valid) {
        throw new BadRequestException(`Primary API key không hợp lệ: ${validation.error}`);
      }
    }
    if (body.secondaryApiKey && body.secondaryProvider) {
      const validation = await this.configService.validateApiKey(body.secondaryProvider, body.secondaryApiKey);
      if (!validation.valid) {
        throw new BadRequestException(`Secondary API key không hợp lệ: ${validation.error}`);
      }
    }

    await this.configService.updateConfig(body as any);
    return { message: 'Đã cập nhật cấu hình' };
  }

  // --- Session History ---

  @Get('admin/sessions')
  @UseGuards(AuthGuard('jwt'))
  async listSessions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sessionService.listSessions(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('admin/sessions/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSession(@Param('id') id: string) {
    return this.sessionService.getSessionWithMessages(id);
  }
}
