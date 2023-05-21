import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { ASYNC_STORAGE } from '../modules/async-storage/async-storage.const'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncStorageType } from '../modules/async-storage/async-storage.type'
import { generateUUID } from '../helpers/crypto.helper'
import { getResponseLog } from '../helpers/logger.helper'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(ASYNC_STORAGE) private readonly asyncStorage: AsyncLocalStorage<AsyncStorageType>) {}

  use(req: Request, res: Response, next: NextFunction) {
    const logger = new Logger()
    const traceId: string = (req.headers['x-request-id'] || generateUUID()) as string
    const store = new Map().set('traceId', traceId)

    logger.log({
      type: 'request',
      protocol: 'http',
      trace_id: traceId,
      method: req.method,
      path: req.originalUrl,
      data: req.body || {},
      headers: req.headers,
      system: false,
    })

    res.setHeader('app-release-tag', process.env.APP_RELEASE_TAG ?? 'aaaa0000')

    this.asyncStorage.run(store, () => {
      getResponseLog(res, logger, traceId)
      next()
    })
  }
}
