// Structured Logger — production-ready logging with levels, timestamps, and context.

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const minLevel = LEVELS[(process.env.LOG_LEVEL as LogLevel) || "info"];

function formatTime(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>) {
  if (LEVELS[level] < minLevel) return;

  const entry = {
    time: formatTime(),
    level: level.toUpperCase(),
    module,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export function createLogger(module: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) => log("debug", module, message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log("info", module, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log("warn", module, message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log("error", module, message, meta),
  };
}
