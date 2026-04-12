import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class UpdateConfigDto {
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsOptional()
  @IsIn(['openai', 'gemini'])
  primaryProvider?: string;

  @IsString()
  @IsOptional()
  primaryApiKey?: string;

  @IsString()
  @IsOptional()
  @IsIn(['openai', 'gemini'])
  secondaryProvider?: string;

  @IsString()
  @IsOptional()
  secondaryApiKey?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(100)
  maxMessagesPerSession?: number;
}
