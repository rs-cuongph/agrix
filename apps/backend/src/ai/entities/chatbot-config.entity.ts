import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chatbot_config')
export class ChatbotConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'system_prompt',
    type: 'text',
    default:
      'Bạn là chuyên gia nông nghiệp của Agrix. Trả lời câu hỏi dựa trên tài liệu cung cấp. Nếu không tìm thấy thông tin liên quan, hãy nói rõ ràng và gợi ý liên hệ cửa hàng. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.',
  })
  systemPrompt: string;

  @Column({ name: 'primary_provider', default: 'openai' })
  primaryProvider: string;

  @Column({ name: 'primary_api_key', nullable: true })
  primaryApiKey: string;

  @Column({ name: 'secondary_provider', nullable: true })
  secondaryProvider: string;

  @Column({ name: 'secondary_api_key', nullable: true })
  secondaryApiKey: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'max_messages_per_session', type: 'int', default: 20 })
  maxMessagesPerSession: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
