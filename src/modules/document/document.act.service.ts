import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class DocumentActService {
  constructor(private prisma: PrismaService) {}
  async getDocumentActById(actId) {
    return await this.prisma.documentAct.findUniqueOrThrow({
      where: { id: actId },
      select: {
        order: {
          select: {
            externalNumber: true,
            name: true,
            price: true,
          },
        },
        actRows: {
          select: {
            id: true,
            date: true,
            note: true,
            createdAt: true,
            dcName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
        comitent: true,
        commissioner: true,
        commissionerAgent: true,
        contractNumber: true,
        contractDate: true,
        specialMarks: true,
      },
    })
  }
}
