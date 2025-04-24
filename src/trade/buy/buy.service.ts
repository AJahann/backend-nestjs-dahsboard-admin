import { Injectable, BadRequestException } from '@nestjs/common';
import { GoldPriceService } from 'src/core/services/gold-price.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BuyService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async buyGold(userId: string, grams: number) {
    const { pricePerGram } = await this.goldPriceService.getCurrentPrice();

    const totalAmount = grams * pricePerGram;
    const fee = this.calculateFee(totalAmount);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { cashBalance: true },
      });

      if (wallet?.cashBalance ? wallet.cashBalance < totalAmount + fee : false) {
        throw new BadRequestException('موجودی نقدی کافی نیست');
      }

      const [updatedWallet] = await Promise.all([
        tx.wallet.update({
          where: { userId },
          data: {
            cashBalance: { decrement: totalAmount + fee },
            goldAmount: { increment: grams },
          },
        }),
      ]);

      return {
        success: true,
        transactionId: `TRX-${Date.now()}`,
        grams,
        unitPrice: pricePerGram,
        totalAmount,
        fee,
        newBalance: {
          gold: updatedWallet.goldAmount,
          cash: updatedWallet.cashBalance,
        },
      };
    });
  }

  private calculateFee(amount: number): number {
    return Math.max(1000, amount * 0.005);
  }
}
