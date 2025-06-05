import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { GoldPriceService } from '../../core/services/gold-price.service';
import { ActionType } from '@prisma/client';
import { SellGoldDto } from './dto/sell.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class SellService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async sellGold(userId: string, sellGoldDto: SellGoldDto) {
    const { grams } = sellGoldDto;

    const { pricePerGram } = await this.goldPriceService.getCurrentPrice();

    const gramsBN = new BigNumber(grams);
    const pricePerGramBN = new BigNumber(pricePerGram);
    const totalAmountBN = gramsBN.multipliedBy(pricePerGramBN);
    const feeBN = 0;
    const netAmountBN = totalAmountBN.minus(feeBN);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { goldAmount: true, cashBalance: true },
      });

      if (!wallet) {
        throw new NotFoundException('کیف پول یافت نشد');
      }

      const cashBalanceBN = new BigNumber(wallet.cashBalance);
      const goldAmountBN = new BigNumber(wallet.goldAmount);

      if (goldAmountBN.isLessThan(gramsBN)) {
        throw new BadRequestException('موجودی طلای کافی نیست');
      }

      const [updatedWallet] = await Promise.all([
        tx.wallet.update({
          where: { userId },
          data: {
            cashBalance: Number(cashBalanceBN.plus(netAmountBN).toFixed(0)),
            goldAmount: Number(goldAmountBN.minus(gramsBN).toFixed(2)),
          },
        }),
      ]);

      await tx.action.create({
        data: {
          type: ActionType.TRADE,
          amount: gramsBN.toNumber(),
          userId,
          metadata: {
            action: 'SELL_GOLD',
            unitPrice: pricePerGramBN.toNumber(),
            totalAmount: totalAmountBN.toNumber(),
            fee: feeBN,
            newGoldBalance: updatedWallet.goldAmount,
            newCashBalance: updatedWallet.cashBalance,
          },
        },
      });

      return {
        success: true,
        transactionId: `TRX-${Date.now()}`,
        grams: gramsBN.toNumber(),
        unitPrice: pricePerGramBN.toNumber(),
        totalAmount: totalAmountBN.toNumber(),
        fee: feeBN,
        newBalance: {
          gold: updatedWallet.goldAmount,
          cash: updatedWallet.cashBalance,
        },
      };
    });
  }
}
