import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { ChatConfigService } from './chat-config.service';

@Injectable()
export class ChatSessionService {
  private readonly logger = new Logger(ChatSessionService.name);

  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    private readonly configService: ChatConfigService,
  ) {}

  /**
   * Get or create a chat session.
   */
  async getOrCreateSession(
    sessionId?: string,
    productId?: string,
    productContext?: string,
    ipAddress?: string,
  ): Promise<ChatSession> {
    if (sessionId) {
      const existing = await this.sessionRepo.findOne({ where: { id: sessionId } });
      if (existing) return existing;
    }

    const session = this.sessionRepo.create({
      productId,
      productContext,
      ipAddress,
    });
    return this.sessionRepo.save(session);
  }

  /**
   * Add a user message to the session. Enforces rate limit and session limit.
   * @param isInternalUser - If true (JWT-verified), skip the per-session message limit.
   */
  async addUserMessage(sessionId: string, content: string, ipAddress?: string, isInternalUser = false): Promise<ChatMessage> {
    const config = await this.configService.getConfig();

    // Check session message limit — skipped for authenticated internal users (POS / Admin)
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new BadRequestException('Session not found');

    if (!isInternalUser) {
      if (session.messageCount >= config.maxMessagesPerSession * 2) {
        throw new BadRequestException(
          `Đã đạt giới hạn ${config.maxMessagesPerSession} tin nhắn cho phiên này. Vui lòng mở phiên mới.`,
        );
      }
    }

    // Rate limit check: max 10 user messages per minute per IP
    if (ipAddress) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentCount = await this.messageRepo.count({
        where: {
          session: { ipAddress },
          role: MessageRole.USER,
          createdAt: MoreThan(oneMinuteAgo),
        },
        relations: ['session'],
      });
      if (recentCount >= 10) {
        throw new BadRequestException('Bạn đang gửi quá nhanh. Vui lòng đợi 1 phút.');
      }
    }

    // Save user message
    const message = this.messageRepo.create({
      sessionId,
      role: MessageRole.USER,
      content,
    });
    const saved = await this.messageRepo.save(message);

    // Increment message count
    await this.sessionRepo.increment({ id: sessionId }, 'messageCount', 1);

    return saved;
  }

  /**
   * Add an assistant message to the session.
   */
  async addAssistantMessage(
    sessionId: string,
    content: string,
    sources?: { documentId: string; chunkIndex: number; snippet: string }[],
  ): Promise<ChatMessage> {
    const message = this.messageRepo.create({
      sessionId,
      role: MessageRole.ASSISTANT,
      content,
      sources,
    });
    const saved = await this.messageRepo.save(message);
    await this.sessionRepo.increment({ id: sessionId }, 'messageCount', 1);
    return saved;
  }

  /**
   * List sessions with pagination (admin).
   */
  async listSessions(page = 1, limit = 20, from?: Date, to?: Date) {
    const qb = this.sessionRepo.createQueryBuilder('session');

    if (from) qb.andWhere('session.created_at >= :from', { from });
    if (to) qb.andWhere('session.created_at <= :to', { to });

    qb.orderBy('session.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page };
  }

  /**
   * Get session with all messages (admin).
   */
  async getSessionWithMessages(sessionId: string) {
    return this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' as any } },
    });
  }

  /**
   * Delete sessions older than 30 days.
   */
  async cleanupOldSessions(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.sessionRepo.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });
    const count = result.affected || 0;
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} old chat sessions`);
    }
    return count;
  }
}
