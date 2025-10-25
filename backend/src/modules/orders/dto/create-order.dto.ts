import { IsInt, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsInt()
  productId: number;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  companyId: number;

  @IsInt()
  partnerId: number;

  @IsInt()
  createdById: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
