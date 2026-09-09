import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { SearchPaginationDto } from 'src/common/pagination/search-pagination.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class ListStockLevelsDto extends SearchPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warehouseId?: number;

  /** `?belowAlert=true` : uniquement les références sous leur seuil. */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  belowAlert?: boolean;
}

export class ListStockMovementsDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warehouseId?: number;
}
