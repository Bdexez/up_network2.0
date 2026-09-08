import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;
}
