import { IsEnum, IsOptional } from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ListPurchaseOrdersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;
}
