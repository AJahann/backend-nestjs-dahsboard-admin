import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GoldPriceService } from '../../core/services/gold-price.service';
import { ActionType } from '@prisma/client';
import { SellGoldDto } from './dto/sell.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SellService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async sellGold(userId: string, sellGoldDto: SellGoldDto) {
    const { grams } = sellGoldDto;

    const { pricePerGram } = await this.goldPriceService.getCurrentPrice();
    const totalAmount = grams * pricePerGram;
    const fee = this.calculateFee(totalAmount);
    const netAmount = totalAmount - fee;

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { goldAmount: true },
      });

      if (!wallet) {
        throw new NotFoundException('کیف پول یافت نشد');
      }

      if (wallet.goldAmount < grams) {
        throw new BadRequestException('موجودی طلای کافی نیست');
      }

      const [updatedWallet] = await Promise.all([
        tx.wallet.update({
          where: { userId },
          data: {
            goldAmount: { decrement: grams },
            cashBalance: { increment: netAmount },
          },
        }),
      ]);

      await tx.action.create({
        data: {
          type: ActionType.TRADE,
          amount: grams,
          userId,
          metadata: {
            action: 'SELL_GOLD',
            unitPrice: pricePerGram,
            totalAmount,
            fee,
            newGoldBalance: updatedWallet.goldAmount,
            newCashBalance: updatedWallet.cashBalance,
          },
        },
      });

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
    return Math.max(1000, amount * 0.003);
  }
}
