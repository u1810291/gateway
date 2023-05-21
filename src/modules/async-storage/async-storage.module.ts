import { Module } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { ASYNC_STORAGE } from './async-storage.const'

const asyncLocalStorage = new AsyncLocalStorage()

@Module({
  providers: [
    {
      provide: ASYNC_STORAGE,
      useValue: asyncLocalStorage,
    },
  ],
  exports: [ASYNC_STORAGE],
})
export class AsyncStorageModule {}
