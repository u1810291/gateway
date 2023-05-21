import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import * as Sentry from '@sentry/node'
import { Request, Response } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    let code = exception?.response?.statusCode || 500
    let error = exception?.response?.message || 'Internal server error'

    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.name) {
        case 'NotFoundError':
          code = 404
          error = exception.message
          break
        default:
          code = 500
          error = `Internal server error ${exception.code}`
      }
    }

    const excludedErrorCodes = [404, 400, 401]
    const body = {
      message: error,
    }

    if (code > 400 && !excludedErrorCodes.includes(code)) {
      Sentry.captureException(exception, {
        tags: {
          code: code,
        },
        extra: {
          reqBody: request.body,
          reqHeaders: request.headers,
          reqQuery: request.query,
          resBody: body,
        },
      })
    }

    response.status(code).json(body)
  }
}
