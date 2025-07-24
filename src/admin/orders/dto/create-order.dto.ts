export class CreateOrderDto {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  userId: string;
}
