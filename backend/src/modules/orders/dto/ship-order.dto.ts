import { IsInt, IsOptional } from 'class-validator';

export class ShipOrderDto {
  /** Entrepôt à décrémenter ; à défaut, l'entrepôt par défaut de la société. */
  @IsOptional()
  @IsInt()
  warehouseId?: number;
}
