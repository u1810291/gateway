import { Injectable, NotFoundException } from '@nestjs/common'
import { getDataTypes } from 'src/helpers/db.helper'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanySettings(companyId: string) {
    const companySettings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    })

    if (!companySettings) {
      throw new NotFoundException('CompanySettings not found')
    }

    return {
      data: companySettings,
      fields: await getDataTypes(this.prisma, 'company_settings'),
    }
  }
}
