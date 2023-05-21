import { BadRequestException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { SharedResponse } from '@slp/shared'

export const getDataOrThrow = async <T>(response: Promise<SharedResponse<T>>): Promise<T> => {
  const result = await response

  if (result.hasError) {
    switch (result.status) {
      case 400:
        throw new BadRequestException(result.statusText)
      case 401:
        throw new UnauthorizedException(result.statusText)
      case 404:
        throw new NotFoundException(result.statusText)
      default:
        throw new BadRequestException(result.statusText)
    }

    throw new HttpException(result.statusText, result.status)
  }

  return result.data
}
