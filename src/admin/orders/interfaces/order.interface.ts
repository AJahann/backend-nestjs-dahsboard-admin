import { OrderStatus } from '@prisma/client';

export interface OrderWithItems {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      brand: string;
      gram: number;
    };
  }>;
}
