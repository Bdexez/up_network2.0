// src/modules/invoices/dto/create-invoice.dto.ts
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  orderId: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
