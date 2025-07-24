import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoldPriceService } from '../gold-price/gold-price.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async createOrder(userId: string) {
    const { buyPrice, sellPrice } = await this.goldPriceService.getLatestPrices();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        basketItems: {
          include: { product: true },
        },
      },
    });

    if (!user) {
      throw new Error('کاربر یافت نشد');
    }

    if (!user.wallet) {
      throw new Error('کیف پول کاربر یافت نشد');
    }

    if (user.basketItems.length === 0) {
      throw new Error('سبد خرید خالی است');
    }

    const { totalGoldWeight, totalPrice, orderItems } = user.basketItems.reduce(
      (acc, item) => {
        const itemGoldWeight = item.product.gram * item.quantity;
        const itemPrice = item.product.gram * buyPrice * item.quantity;
        return {
          totalGoldWeight: acc.totalGoldWeight + itemGoldWeight,
          totalPrice: acc.totalPrice + itemPrice,
          orderItems: [
            ...acc.orderItems,
            {
              productId: item.productId,
              quantity: item.quantity,
              gram: item.product.gram,
              price: buyPrice, // Price per gram
              total: itemPrice,
              product: item.product,
            },
          ],
        };
      },
      { totalGoldWeight: 0, totalPrice: 0, orderItems: [] },
    );

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalPrice: totalPrice,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              gram: item.gram,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      await tx.action.create({
        data: {
          type: 'ORDER',
          amount: totalGoldWeight,
          userId,
          metadata: {
            orderId: order.id,
            sellPricePerGram: sellPrice,
            buyPricePerGram: buyPrice,
            products: orderItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              quantity: item.quantity,
              gram: item.gram,
              pricePerGram: item.price,
              totalPrice: item.total,
            })),
          },
        },
      });

      await tx.basketItem.deleteMany({ where: { userId } });

      return {
        orderId: order.id,
        status: order.status,
        totalGoldWeight,
        totalPrice,
        sellPricePerGram: sellPrice,
        buyPricePerGram: buyPrice,
        products: orderItems.map((item) => ({
          id: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          gram: item.gram,
          pricePerGram: item.price,
          totalPrice: item.total,
        })),
      };
    });
  }
}
