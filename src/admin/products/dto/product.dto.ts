export class ProductDto {
  id: string;
  name: string;
  img: string;
  wages: string;
  brand: string;
  type: string;
  gram: number;
}

export class AddToBasketDto {
  productId: string;
}

export class CreateOrderDto {
  productIds: string[];
}
