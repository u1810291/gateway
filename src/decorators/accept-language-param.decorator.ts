import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const AcceptLanguage = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest()

  return request.header('Accept-Language') || 'ru'
})
