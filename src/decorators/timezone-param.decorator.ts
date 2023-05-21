import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const Timezone = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest()

  return request.header('TZ') || 'UTC'
})
