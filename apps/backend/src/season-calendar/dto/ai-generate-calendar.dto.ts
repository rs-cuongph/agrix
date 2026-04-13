import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GrowthStageType, PestWarningSeverity } from '../entities';

export class AiGenerateCalendarDto {
  @IsUUID()
  zoneId: string;

  @IsUUID()
  cropId: string;

  @IsString()
  @IsOptional()
  userNotes?: string;
}

export class BulkCreatePestWarningDto {
  @IsString()
  name: string;

  @IsEnum(PestWarningSeverity)
  severity: PestWarningSeverity;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  preventionNote?: string;
}

export class BulkCreateStageDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreatePestWarningDto)
  @IsOptional()
  pestWarnings?: BulkCreatePestWarningDto[];
}

export class BulkCreateSeasonDto {
  @IsString()
  seasonName: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateStageDto)
  stages: BulkCreateStageDto[];
}

export class BulkCreateCalendarDto {
  @IsUUID()
  zoneId: string;

  @IsUUID()
  cropId: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  replaceExisting?: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateSeasonDto)
  seasons: BulkCreateSeasonDto[];
}
