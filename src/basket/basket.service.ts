import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasketItemDto } from './dto/basket-item.dto';
import BigNumber from 'bignumber.js';

@Injectable()
export class BasketService {
  constructor(private prisma: PrismaService) {}

  async addToBasket(userId: string, productId: string): Promise<BasketItemDto> {
    return this.prisma.$transaction(async (tx) => {
      // اضافه کردن include برای basketItems
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          wallet: true,
          basketItems: true, // اضافه شده
        },
      });

      if (!user?.wallet) {
        throw new NotFoundException('کاربر یا کیف پول یافت نشد');
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('محصول یافت نشد');
      }

      const goldAmountBN = new BigNumber(user.wallet.goldAmount);
      const productGramBN = new BigNumber(product.gram);

      if (goldAmountBN.isLessThan(productGramBN)) {
        throw new BadRequestException('موجودی طلای کافی نیست');
      }

      await tx.wallet.update({
        where: { userId },
        data: {
          goldAmount: Number(goldAmountBN.minus(productGramBN).toFixed(2)),
        },
      });

      const basketItem = await tx.basketItem.upsert({
        where: { productId_userId: { productId, userId } },
        update: { quantity: { increment: 1 } },
        create: { productId, userId, quantity: 1 },
        include: { product: true },
      });

      // به‌روزرسانی رابطه User با BasketItem
      if (!user.basketItems.some((item) => item.productId === productId)) {
        await tx.user.update({
          where: { id: userId },
          data: {
            basketItems: {
              connect: { productId_userId: { productId, userId } },
            },
          },
        });
      }

      await tx.action.create({
        data: {
          type: 'TRADE',
          amount: product.gram,
          userId,
          metadata: {
            action: 'ADD_TO_BASKET',
            productId,
            productName: product.name,
          },
        },
      });

      return {
        id: basketItem.product.id,
        name: basketItem.product.name,
        wages: basketItem.product.wages,
        gram: basketItem.product.gram,
        count: basketItem.quantity,
      };
    });
  }

  async removeFromBasket(userId: string, productId: string): Promise<BasketItemDto> {
    return this.prisma.$transaction(async (tx) => {
      const basketItem = await tx.basketItem.findUnique({
        where: { productId_userId: { productId, userId } },
        include: { product: true },
      });

      if (!basketItem) {
        throw new NotFoundException('آیتم در سبد خرید یافت نشد');
      }

      const productGramBN = new BigNumber(basketItem.product.gram);
      const returnAmountBN = productGramBN.multipliedBy(basketItem.quantity);

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('کیف پول یافت نشد');
      }

      const newGoldAmount = Number(
        new BigNumber(wallet.goldAmount).plus(returnAmountBN).toFixed(2),
      );

      await tx.wallet.update({
        where: { userId },
        data: { goldAmount: newGoldAmount },
      });

      await tx.basketItem.delete({
        where: { productId_userId: { productId, userId } },
      });

      // به‌روزرسانی رابطه User با BasketItem
      await tx.user.update({
        where: { id: userId },
        data: {
          basketItems: {
            disconnect: { productId_userId: { productId, userId } },
          },
        },
      });

      await tx.action.create({
        data: {
          type: 'TRADE',
          amount: returnAmountBN.toNumber(),
          userId,
          metadata: {
            action: 'REMOVE_FROM_BASKET',
            productId,
            productName: basketItem.product.name,
          },
        },
      });

      return {
        id: basketItem.product.id,
        name: basketItem.product.name,
        wages: basketItem.product.wages,
        gram: basketItem.product.gram,
        count: 0,
      };
    });
  }

  async clearBasket(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { basketItems: true },
      });

      if (!user?.basketItems || user.basketItems.length === 0) return;

      const basketItems = await tx.basketItem.findMany({
        where: { userId },
        include: { product: true },
      });

      const totalReturnBN = basketItems.reduce((sum, item) => {
        const itemGramBN = new BigNumber(item.product.gram);
        return sum.plus(itemGramBN.multipliedBy(item.quantity));
      }, new BigNumber(0));

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('کیف پول یافت نشد');
      }

      const newGoldAmount = Number(new BigNumber(wallet.goldAmount).plus(totalReturnBN).toFixed(2));

      await tx.wallet.update({
        where: { userId },
        data: { goldAmount: newGoldAmount },
      });

      // قطع تمام ارتباطات BasketItem از User
      await tx.user.update({
        where: { id: userId },
        data: {
          basketItems: {
            disconnect: user.basketItems.map((item) => ({
              productId_userId: {
                productId: item.productId,
                userId: item.userId,
              },
            })),
          },
        },
      });

      await tx.basketItem.deleteMany({ where: { userId } });

      await tx.action.create({
        data: {
          type: 'TRADE',
          amount: totalReturnBN.toNumber(),
          userId,
          metadata: {
            action: 'CLEAR_BASKET',
            itemsCount: basketItems.length,
          },
        },
      });
    });
  }
}
