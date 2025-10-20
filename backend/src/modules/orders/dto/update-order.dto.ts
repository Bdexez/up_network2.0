import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemUpdate {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  partnerId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemUpdate)
  items?: OrderItemUpdate[];
}
