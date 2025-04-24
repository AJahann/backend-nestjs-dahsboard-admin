import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WithdrawService {
  constructor(private prisma: PrismaService) {}

  async processWithdraw(userId: string, amount: number | string, cardId: string) {
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount)) {
      throw new BadRequestException('مبلغ برداشت نامعتبر است');
    }

    return this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { id: cardId, userId },
        select: { id: true, cardName: true },
      });

      if (!card) {
        throw new NotFoundException('کارت بانکی یافت نشد');
      }

      if (withdrawAmount < 10000) {
        throw new BadRequestException('حداقل برداشت ۱۰,۰۰۰ تومان است');
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { cashBalance: true },
      });

      if (wallet?.cashBalance ? wallet?.cashBalance < withdrawAmount : true) {
        throw new BadRequestException('موجودی ناکافی');
      }

      const transferResult = await this.simulateBankTransfer(cardId, withdrawAmount);
      if (!transferResult.success) {
        throw new BadRequestException('انتقال وجه ناموفق بود');
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          cashBalance: { decrement: withdrawAmount },
        },
        select: { cashBalance: true },
      });

      await tx.action.create({
        data: {
          type: ActionType.WITHDRAW,
          amount: withdrawAmount,
          userId,
          metadata: {
            action: 'WITHDRAW',
            newBalance: updatedWallet.cashBalance,
            fee: this.calculateWithdrawFee(withdrawAmount),
          },
        },
      });

      return {
        success: true,
        amount: withdrawAmount,
        newBalance: updatedWallet.cashBalance,
        trackingCode: transferResult.trackingCode,
        fee: this.calculateWithdrawFee(withdrawAmount),
      };
    });
  }

  private calculateWithdrawFee(amount: number): number {
    return Math.max(1000, amount * 0.01);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async simulateBankTransfer(_cardId: string, _amount: number) {
    return {
      success: true,
      trackingCode: `WTRX-${Date.now()}`,
      timestamp: new Date(),
      cardLast4: '6789',
    };
  }
}
