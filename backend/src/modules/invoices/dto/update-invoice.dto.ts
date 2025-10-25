// src/modules/invoices/dto/update-invoice.dto.ts
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
