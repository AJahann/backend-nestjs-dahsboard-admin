import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepositService {
  constructor(private prisma: PrismaService) {}

  async processDeposit(userId: string, amount: number, cardId: string) {
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

      // await tx.transaction.create({
      //   data: {
      //     amount,
      //     fee: 0,
      //     type: 'DEPOSIT',
      //     status: 'COMPLETED',
      //     userId,
      //     metadata: {
      //       cardId,
      //       gatewayResponse: paymentResult
      //     }
      //   }
      // });

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
