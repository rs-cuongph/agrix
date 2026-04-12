import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum ReportingGranularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class ReportingFilterDto {
  @IsEnum(ReportingGranularity)
  @IsOptional()
  granularity?: ReportingGranularity;

  @IsISO8601()
  @IsOptional()
  from?: string;

  @IsISO8601()
  @IsOptional()
  to?: string;
}

export class RankingQueryDto extends ReportingFilterDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}

export class TopCustomersQueryDto extends ReportingFilterDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  purchaseLimit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  debtLimit?: number;
}

export class ExportReportDto {
  @IsIn(['pdf', 'xlsx'])
  format!: 'pdf' | 'xlsx';

  @ValidateNested()
  @Type(() => ReportingFilterDto)
  filter!: ReportingFilterDto;
}
