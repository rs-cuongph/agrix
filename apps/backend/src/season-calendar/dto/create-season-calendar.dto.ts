import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { GrowthStageType } from '../entities';

export class CreateSeasonCalendarDto {
  @IsUUID()
  zoneId: string;

  @IsUUID()
  cropId: string;

  @IsString()
  seasonName: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSeasonCalendarDto {
  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsUUID()
  @IsOptional()
  cropId?: string;

  @IsString()
  @IsOptional()
  seasonName?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;
}

export class CreateGrowthStageDto {
  @IsUUID()
  @IsOptional()
  seasonCalendarId?: string;

  @IsString()
  name: string;

  @IsEnum(GrowthStageType)
  stageType: GrowthStageType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  startMonth: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  endMonth: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  careActivities?: string[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateGrowthStageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(GrowthStageType)
  @IsOptional()
  stageType?: GrowthStageType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  startMonth?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  endMonth?: number;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  careActivities?: string[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateProductRecommendationDto {
  @IsUUID()
  @IsOptional()
  growthStageId?: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  dosageNote?: string;
}
