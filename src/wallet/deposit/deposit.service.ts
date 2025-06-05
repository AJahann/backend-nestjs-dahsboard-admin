import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepositService {
  constructor(private prisma: PrismaService) {}

  async processDeposit(userId: string, amount: number, cardId: string) {
    const currentUserCashBalance = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { cashBalance: true },
    });

    if (currentUserCashBalance && currentUserCashBalance.cashBalance > 200_000_000) {
      throw new BadRequestException('حداکثر موجودی نقدی ۲۰۰,۰۰۰,۰۰۰ تومان است');
    }

    return this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { id: cardId, userId },
        select: { id: true, cardName: true },
      });

      if (!card) {
        throw new NotFoundException('کارت بانکی یافت نشد');
      }

      if (amount < 10000) {
        throw new BadRequestException('حداقل مبلغ واریز ۱۰,۰۰۰ تومان است');
      }

      const paymentResult = await this.simulatePaymentGateway(cardId, amount);
      if (!paymentResult.success) {
        throw new BadRequestException('پرداخت ناموفق بود');
      }

      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          cashBalance: { increment: Number(amount) },
        },
        select: { cashBalance: true },
      });

      await tx.action.create({
        data: {
          type: ActionType.PAYMENT,
          amount,
          userId,
          metadata: {
            action: 'DEPOSIT',
            newBalance: wallet.cashBalance,
          },
        },
      });

      return {
        success: true,
        amount,
        newBalance: wallet.cashBalance,
        trackingCode: paymentResult.trackingCode,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async simulatePaymentGateway(_cardId: string, _amount: number) {
    return {
      success: true,
      trackingCode: `TRX-${Date.now()}`,
      timestamp: new Date(),
      cardLast4: '1234',
    };
  }
}
