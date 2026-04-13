import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface ServiceLogEntry {
  timestamp: string;
  service: string;
  provider?: string;
  action: string;
  duration?: number;
  status: 'request' | 'success' | 'error' | 'retry';
  request?: Record<string, unknown>;
  response?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * File-based logger for 3rd party service calls (AI providers, external APIs).
 * Writes structured JSON logs to `logs/services/` directory for post-incident investigation.
 *
 * Log files:
 * - logs/services/ai-{date}.log     — AI provider calls (OpenAI, Gemini)
 * - logs/services/external-{date}.log — Other external service calls
 *
 * Each line is a JSON object (JSONL format) for easy parsing with jq/grep.
 *
 * Usage:
 *   this.serviceLogger.log({ service: 'ai', provider: 'gemini', action: 'generate', ... });
 *   this.serviceLogger.logAiCall(provider, action, request, response, duration);
 */
@Injectable()
export class ServiceLoggerService implements OnModuleInit {
  private readonly logger = new Logger(ServiceLoggerService.name);
  private logDir: string;
  private enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<string>('SERVICE_LOG_ENABLED', 'true') !== 'false';
    this.logDir = this.configService.get<string>(
      'SERVICE_LOG_DIR',
      path.join(process.cwd(), 'logs', 'services'),
    );
  }

  onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Service file logging is DISABLED');
      return;
    }

    try {
      fs.mkdirSync(this.logDir, { recursive: true });
      this.logger.log(`Service logs writing to: ${this.logDir}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create log directory: ${message}`);
      this.enabled = false;
    }
  }

  /**
   * Write a structured log entry to file.
   */
  log(entry: ServiceLogEntry): void {
    if (!this.enabled) return;

    const logEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    const category = entry.service === 'ai' ? 'ai' : 'external';
    const fileName = `${category}-${this.getDateString()}.log`;
    const filePath = path.join(this.logDir, fileName);

    try {
      fs.appendFileSync(filePath, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to write service log: ${message}`);
    }
  }

  /**
   * Convenience: log an AI provider call with timing.
   */
  logAiCall(params: {
    provider: string;
    action: string;
    status: 'request' | 'success' | 'error' | 'retry';
    durationMs?: number;
    request?: Record<string, unknown>;
    response?: string;
    error?: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.log({
      timestamp: new Date().toISOString(),
      service: 'ai',
      provider: params.provider,
      action: params.action,
      duration: params.durationMs,
      status: params.status,
      request: params.request,
      response: params.response
        ? params.response.length > 5000
          ? params.response.substring(0, 5000) + '...[TRUNCATED]'
          : params.response
        : undefined,
      error: params.error,
      metadata: params.metadata,
    });
  }

  /**
   * Get the log file path for a given date (for reading logs).
   */
  getLogFilePath(category: 'ai' | 'external', date?: Date): string {
    const dateStr = this.getDateString(date);
    return path.join(this.logDir, `${category}-${dateStr}.log`);
  }

  /**
   * Read recent log entries for investigation.
   */
  readRecentLogs(
    category: 'ai' | 'external',
    limit = 50,
    date?: Date,
  ): ServiceLogEntry[] {
    const filePath = this.getLogFilePath(category, date);

    try {
      if (!fs.existsSync(filePath)) return [];

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      const recentLines = lines.slice(-limit);

      return recentLines.map((line) => {
        try {
          return JSON.parse(line) as ServiceLogEntry;
        } catch {
          return {
            timestamp: new Date().toISOString(),
            service: category,
            action: 'parse_error',
            status: 'error' as const,
            response: line,
          };
        }
      });
    } catch {
      return [];
    }
  }

  private getDateString(date?: Date): string {
    const d = date || new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
}
