import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DocumentTtnService {
  constructor(private prisma: PrismaService) {}
  async getDocumentTTNById(ttnId) {
    return await this.prisma.documentTTN.findUniqueOrThrow({
      where: {
        id: ttnId
      },
      include: {
        order: {
          select: {
            externalNumber: true,
            name: true,
            dimension: {
              select: {
                weight: true,
              }
            }
          }
        },
        ttnRows: {
          select: {
            date: true,
            createdAt: true,
            note: true,
            storage: {
              select: {
                code: true,
                name: true,
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })
  }
}
