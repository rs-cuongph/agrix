import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../inventory/entities/product.entity';
import {
  AgriculturalZone,
  Crop,
  GrowthStage,
  PestWarning,
  PestWarningProduct,
  ProductRecommendation,
  SeasonCalendar,
  SeasonActivityLog,
  WeatherBaseline,
} from './entities';
import { ActivityLogController } from './controllers/activity-log.controller';
import { AdminCalendarController } from './controllers/admin-calendar.controller';
import { AdminCropsController } from './controllers/admin-crops.controller';
import { AdminPestWarningsController } from './controllers/admin-pest-warnings.controller';
import { AdminWeatherController } from './controllers/admin-weather.controller';
import { AdminZonesController } from './controllers/admin-zones.controller';
import { CropsController } from './controllers/crops.controller';
import { SeasonCalendarController } from './controllers/season-calendar.controller';
import { SeasonSuggestionController } from './controllers/season-suggestion.controller';
import { WeatherController } from './controllers/weather.controller';
import { ZonesController } from './controllers/zones.controller';
import { ActivityLogService } from './services/activity-log.service';
import { AiCalendarGeneratorService } from './services/ai-calendar-generator.service';
import { CropsService } from './services/crops.service';
import { PestWarningService } from './services/pest-warning.service';
import { SeasonCalendarService } from './services/season-calendar.service';
import { SeasonChatbotContextService } from './services/season-chatbot-context.service';
import { SeasonSuggestionService } from './services/season-suggestion.service';
import { WeatherBaselineService } from './services/weather-baseline.service';
import { ZonesService } from './services/zones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgriculturalZone,
      Crop,
      SeasonCalendar,
      GrowthStage,
      PestWarning,
      PestWarningProduct,
      ProductRecommendation,
      WeatherBaseline,
      SeasonActivityLog,
      Product,
    ]),
    AuthModule,
    forwardRef(() => AIModule),
  ],
  controllers: [
    ZonesController,
    CropsController,
    SeasonCalendarController,
    SeasonSuggestionController,
    WeatherController,
    AdminZonesController,
    AdminCropsController,
    AdminCalendarController,
    AdminPestWarningsController,
    AdminWeatherController,
    ActivityLogController,
  ],
  providers: [
    ZonesService,
    CropsService,
    SeasonCalendarService,
    AiCalendarGeneratorService,
    PestWarningService,
    WeatherBaselineService,
    ActivityLogService,
    SeasonSuggestionService,
    SeasonChatbotContextService,
  ],
  exports: [
    TypeOrmModule,
    ZonesService,
    CropsService,
    SeasonCalendarService,
    AiCalendarGeneratorService,
    PestWarningService,
    WeatherBaselineService,
    ActivityLogService,
    SeasonSuggestionService,
    SeasonChatbotContextService,
  ],
})
export class SeasonCalendarModule {}
