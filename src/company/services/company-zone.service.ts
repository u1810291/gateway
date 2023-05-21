import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { GEOClient } from '../../clients/geo.client'
import { Zone } from '@prisma/client'
import { GEO } from '@slp/shared'

@Injectable()
export class CompanyZoneService {
  constructor(private readonly prisma: PrismaService, private readonly geoClient: GEOClient) {}

  async zoneList(companyId: string) {
    const zones: Zone[] = await this.prisma.zone.findMany({
      where: {
        companyId,
      },
    })

    const { data: places, hasError: placesHasError } = await this.geoClient.placeList({
      ids: zones.map((zone: Zone): string => zone.geoId),
      group_id: companyId,
    })

    if (placesHasError) {
      return []
    }
    const storages: any[] = await this.prisma.storage.findMany({
      where: {
        zoneId: {
          in: zones.map((zone: Zone): string => zone.id),
        },
      },
    })
    const zone = zones.map((zone: Zone) => {
      const place: GEO.Place = places.find((item: GEO.Place): boolean => item.id === zone.geoId)

      if (!place) {
        return []
      }

      const storage: any = storages.find((item: any): boolean => item.zoneId === zone.id)

      return {
        id: zone.id,
        name: zone.name,
        companyId: zone.companyId,
        geoId: zone.geoId,
        storage: {
          id: storage?.id,
          code: storage?.code,
          status: storage?.status,
          coordinate: {
            latitude: storage?.latitude,
            longitude: storage?.longitude,
          },
          point_type: storage?.point_type,
        },
        geometry: {
          type: place.geometry.type,
          coordinates: place.geometry.coordinates,
        },
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt,
      }
    })
    return {
      data: zone,
      fields: await getDataTypes(this.prisma, 'zone'),
      totalDocs: zone.length,
      page: 1,
    }
  }

  async zoneRead(companyId: string, id: string) {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.zone.count({
        where: { id, companyId },
      }),
      this.prisma.zone.findFirst({
        where: { id, companyId },
      }),
    ])

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'zone'),
      totalDocs: total,
      page: 1,
    }
  }

  async checkZoneDeletable(companyId: string, id: string): Promise<boolean> {
    const zone = await this.prisma.zone.findUniqueOrThrow({ where: { id } })

    const storages = await this.prisma.storage.findMany({ where: { zoneId: zone.id } })
    return storages.length === 0
  }

  private async getZone(id: string, companyId: string) {
    const zone: Zone = await this.prisma.zone.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!zone) {
      return []
    }

    return zone
  }
}
