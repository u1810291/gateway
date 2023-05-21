import * as _ from 'lodash'
import { SharedResponse } from '@slp/shared'
import { BadRequestException } from '@nestjs/common'

export const transformToSnakeCase = (obj) =>
  _.transform(obj, (acc, value, key, target) => {
    const camelKey = _.isArray(target) ? key : _.snakeCase(key)

    acc[camelKey] = value !== null && typeof value === 'object' ? transformToSnakeCase(value) : value
  })

export const getDataFromSharedResponse = <T>({ data, hasError, statusText }: SharedResponse<T>) => {
  if (hasError) {
    throw new BadRequestException(statusText)
  }

  return data
}

export function convert(obj, prefix = '', excludes: string[] = []) {
  if (!obj) return
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k]) && !excludes.includes(k))
      Object.assign(acc, convert(obj[k], pre + k, excludes))
    else acc[pre + k] = obj[k]
    return acc
  }, {})
}
