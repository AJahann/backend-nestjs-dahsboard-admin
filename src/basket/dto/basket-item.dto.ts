import { IsNumber, IsString, Min } from 'class-validator';

export class BasketItemDto {
  id: string;
  name: string;
  wages: string;
  gram: number;
  count: number;
}

export class UpdateBasketDto {
  @IsString()
  productId: string;
}
