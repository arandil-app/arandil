import pino from 'pino';

const isDev = (process.env['NODE_ENV'] ?? 'development') !== 'production';

const logger = pino(
  {
    level: process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info'),
    base: {
      service: 'arandil-api',
      env: process.env['NODE_ENV'] ?? 'development',
      version: '0.0.1',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      })
    : undefined,
);

export default logger;
