import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class GeoService {
  constructor(private readonly httpService: HttpService) {}

  async fetchGeo(dcData: { coordinate: { latitude: number; longitude: number } }, orderDeliveries, isFirstMile) {
    const isPool = (poolOrderDelivery) => poolOrderDelivery.orderDelivery || poolOrderDelivery
    return firstValueFrom(
      this.httpService.post('/matrix-algorithm', {
        ...(dcData.coordinate?.latitude &&
          dcData.coordinate?.longitude && {
            first: {
              lat: dcData.coordinate?.latitude,
              lon: dcData.coordinate?.longitude,
            },
          }),
        ...(dcData.coordinate?.latitude &&
          dcData.coordinate?.longitude && {
            last: {
              lat: dcData.coordinate?.latitude,
              lon: dcData.coordinate?.longitude,
            },
          }),
        targets: orderDeliveries.map((orderDelivery) => ({
          lat: isFirstMile(isPool(orderDelivery))
            ? isPool(orderDelivery).from.latitude
            : isPool(orderDelivery).to.latitude,
          lon: isFirstMile(isPool(orderDelivery))
            ? isPool(orderDelivery).from.longitude
            : isPool(orderDelivery).to.longitude,
        })),
      }),
    )
      .then((res) => res.data)
      .catch((err) => {
        throw new BadRequestException(err)
      })
  }
}
