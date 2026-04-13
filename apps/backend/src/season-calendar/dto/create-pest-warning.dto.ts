import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PestWarningSeverity } from '../entities';

export class CreatePestWarningDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  symptoms?: string | null;

  @IsEnum(PestWarningSeverity)
  @IsOptional()
  severity?: PestWarningSeverity;

  @IsString()
  @IsOptional()
  preventionNote?: string | null;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  treatmentProductIds?: string[];

  @IsObject()
  @IsOptional()
  usageNotes?: Record<string, string>;
}

export class UpdatePestWarningDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  symptoms?: string | null;

  @IsEnum(PestWarningSeverity)
  @IsOptional()
  severity?: PestWarningSeverity;

  @IsString()
  @IsOptional()
  preventionNote?: string | null;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  treatmentProductIds?: string[];

  @IsObject()
  @IsOptional()
  usageNotes?: Record<string, string>;
}
