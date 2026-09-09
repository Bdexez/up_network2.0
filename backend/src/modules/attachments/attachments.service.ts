import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentEntity } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  assertAcceptable,
  buildStoragePath,
  resolveStoragePath,
  UPLOADS_DIR,
} from './attachment-storage';

/**
 * Table de correspondance entre le type d'objet et le modèle Prisma qui le
 * porte. Elle sert à vérifier que la cible existe **et** appartient bien à la
 * société : sans ce contrôle, on pourrait joindre un fichier à la facture d'un
 * concurrent et le relire ensuite.
 */
const OWNERS: Record<
  AttachmentEntity,
  (prisma: PrismaService, companyId: number, id: number) => Promise<unknown>
> = {
  PARTNER: (p, companyId, id) =>
    p.partner.findFirst({ where: { id, companyId } }),
  QUOTE: (p, companyId, id) => p.quote.findFirst({ where: { id, companyId } }),
  ORDER: (p, companyId, id) => p.order.findFirst({ where: { id, companyId } }),
  INVOICE: (p, companyId, id) =>
    p.invoice.findFirst({ where: { id, companyId } }),
  PURCHASE_ORDER: (p, companyId, id) =>
    p.purchaseOrder.findFirst({ where: { id, companyId } }),
  PRODUCT: (p, companyId, id) =>
    p.product.findFirst({ where: { id, companyId } }),
  PROJECT: (p, companyId, id) =>
    p.project.findFirst({ where: { id, companyId } }),
};

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async upload(
    companyId: number,
    userId: number,
    file: UploadedFile | undefined,
    meta: { entity: AttachmentEntity; entityId: number; description?: string },
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');

    assertAcceptable(file);
    await this.assertTargetExists(companyId, meta.entity, meta.entityId);

    const storagePath = buildStoragePath(companyId, file.originalname);
    const absolute = path.join(UPLOADS_DIR, storagePath);

    await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
    await fs.promises.writeFile(absolute, file.buffer);

    return this.prisma.attachment.create({
      data: {
        companyId,
        uploadedById: userId,
        entity: meta.entity,
        entityId: meta.entityId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath,
        description: meta.description,
      },
      include: { uploadedBy: { select: { id: true, username: true } } },
    });
  }

  async findAll(companyId: number, entity: AttachmentEntity, entityId: number) {
    await this.assertTargetExists(companyId, entity, entityId);

    return this.prisma.attachment.findMany({
      where: { companyId, entity, entityId },
      include: { uploadedBy: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Chemin sur disque, après vérification d'appartenance à la société. */
  async getFile(companyId: number, id: number) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, companyId },
    });
    if (!attachment) throw new NotFoundException('Pièce jointe introuvable');

    const filePath = resolveStoragePath(attachment.storagePath);
    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier introuvable sur le serveur');
    }

    return {
      filePath,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
    };
  }

  async remove(companyId: number, id: number) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, companyId },
    });
    if (!attachment) throw new NotFoundException('Pièce jointe introuvable');

    const filePath = resolveStoragePath(attachment.storagePath);
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => undefined);
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { message: `« ${attachment.fileName} » supprimé` };
  }

  /** Compteurs par objet, pour afficher un badge sans charger les fichiers. */
  async countFor(
    companyId: number,
    entity: AttachmentEntity,
    entityIds: number[],
  ) {
    if (entityIds.length === 0) return new Map<number, number>();

    const grouped = await this.prisma.attachment.groupBy({
      by: ['entityId'],
      where: { companyId, entity, entityId: { in: entityIds } },
      _count: { _all: true },
    });

    return new Map(grouped.map((row) => [row.entityId, row._count._all]));
  }

  private async assertTargetExists(
    companyId: number,
    entity: AttachmentEntity,
    entityId: number,
  ) {
    const found = await OWNERS[entity](this.prisma, companyId, entityId);
    if (!found) {
      throw new NotFoundException(
        "L'objet auquel rattacher ce fichier est introuvable dans cette société",
      );
    }
  }
}
