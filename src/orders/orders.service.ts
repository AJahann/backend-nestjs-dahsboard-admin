import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasketService } from '../basket/basket.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private basketService: BasketService,
  ) {}

  async createOrder(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        basketItems: {
          include: { product: true },
        },
      },
    });

    if (user === null) {
      throw new Error('کاربر یافت نشد');
    }

    const totalGold = user.basketItems.reduce((sum, item) => {
      return sum + item.product.gram * item.quantity;
    }, 0);

    if (user.wallet && user.wallet.goldAmount < totalGold) {
      throw new Error('مقدار موجودی کافی نیست');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { goldAmount: { decrement: totalGold } },
      });

      const action = await tx.action.create({
        data: {
          type: 'ORDER',
          amount: totalGold,
          userId,
          metadata: {
            products: user.basketItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              quantity: item.quantity,
              gram: item.product.gram,
            })),
          },
        },
      });

      await tx.basketItem.deleteMany({ where: { userId } });

      return {
        orderId: action.id,
        goldDeducted: totalGold,
        remainingBalance: updatedWallet.goldAmount,
        products: user.basketItems.map((item) => ({
          id: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          gram: item.product.gram,
        })),
      };
    });
  }
}
