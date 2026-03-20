import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  productId?: string;
}
