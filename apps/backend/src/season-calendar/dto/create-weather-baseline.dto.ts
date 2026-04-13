import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateWeatherBaselineDto {
  @IsUUID()
  zoneId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  avgTempC: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  avgRainfallMm: number;

  @IsString()
  @IsOptional()
  notes?: string | null;
}
