import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BigNumber from 'bignumber.js';
import { GoldPriceService } from 'src/gold-price/gold-price.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class BuyService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async buyGold(userId: string, amount: number) {
    const { buyPrice: pricePerGram } = await this.goldPriceService.getLatestPrices();

    const amountBN = new BigNumber(amount);
    const pricePerGramBN = new BigNumber(pricePerGram);

    const feeBN = 10_000;
    const totalCostBN = amountBN.minus(feeBN);
    const gramsBN = totalCostBN.dividedBy(pricePerGramBN);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { cashBalance: true, goldAmount: true },
      });

      if (!wallet) {
        throw new BadRequestException('کیف پول یافت نشد');
      }

      const cashBalanceBN = new BigNumber(wallet.cashBalance);
      const goldAmountBN = new BigNumber(wallet.goldAmount);

      if (cashBalanceBN.isLessThan(amountBN)) {
        throw new BadRequestException('موجودی نقدی کافی نیست');
      }

      const [updatedWallet] = await Promise.all([
        tx.wallet.update({
          where: { userId },
          data: {
            cashBalance: Number(cashBalanceBN.minus(amount).toFixed(0)),
            goldAmount: Number(goldAmountBN.plus(gramsBN).toFixed(2)),
          },
        }),
        tx.action.create({
          data: {
            type: ActionType.TRADE,
            amount: gramsBN.toNumber(),
            userId,
            metadata: {
              action: 'BUY_GOLD',
              unitPrice: pricePerGramBN.toNumber(),
              totalAmount: amountBN.toNumber(),
              fee: feeBN,
              newGoldBalance: Number(goldAmountBN.plus(gramsBN).toFixed(2)),
              newCashBalance: Number(cashBalanceBN.minus(amount).toFixed(0)),
            },
          },
        }),
      ]);

      return {
        success: true,
        transactionId: `TRX-${Date.now()}`,
        grams: gramsBN.toNumber(),
        amount: amountBN.toNumber(),
        totalCost: totalCostBN.toNumber(),
        fee: feeBN,
        newBalance: {
          gold: updatedWallet.goldAmount,
          cash: updatedWallet.cashBalance,
        },
      };
    });
  }
}
