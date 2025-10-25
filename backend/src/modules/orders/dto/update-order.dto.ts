import { IsInt, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOrderItemDto {
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
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}
