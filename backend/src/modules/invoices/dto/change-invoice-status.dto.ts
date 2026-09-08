import { IsEnum } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class ChangeInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
