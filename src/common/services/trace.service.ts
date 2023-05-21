import { Inject, Injectable } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable()
export class TraceService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getParentId(): string {
    return this.request.headers['traceparent'] as string
  }
}
