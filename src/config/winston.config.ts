import * as winston from 'winston'
import { createLogger, format } from 'winston'
import { WinstonModule } from 'nest-winston'
import * as process from 'process'

const logCustomFormat = format.printf(({ level, message, timestamp, value, service }) => {
  const { system, ...data } = value

  return JSON.stringify({
    message: message,
    ...data,
    timestamp: timestamp,
    level: level,
    service: service,
  })
})

const ignoreSystem = format((info) => {
  if (info.level !== 'error' && (info?.system === undefined || info.system)) {
    return false
  }

  return info
})

const winstonInstance = createLogger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      format: format.combine(ignoreSystem(), format.timestamp(), logCustomFormat),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: format.combine(format.timestamp(), logCustomFormat),
    }),
  ],
  defaultMeta: { service: process.env.APP_NAME || 'app' },
})

export const winstonLogger = WinstonModule.createLogger({
  instance: winstonInstance,
})
