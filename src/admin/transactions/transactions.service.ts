import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TradeTransaction, TransactionFilterDto } from './dto/transaction-filter.dto';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTradeTransactions(filter: TransactionFilterDto): Promise<TradeTransaction[]> {
    const where: Prisma.ActionWhereInput = this.buildWhereClause(filter);

    const transactions = await this.prisma.action.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: this.getSelectFields(),
    });

    return transactions.map(this.transformTransaction);
  }

  private buildWhereClause(filter: TransactionFilterDto): Prisma.ActionWhereInput {
    const where: Prisma.ActionWhereInput = {
      type: 'TRADE',
      metadata: {
        path: ['action'],
        not: 'ADD_TO_BASKET',
      },
    };

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
    }

    if (filter.tradeType && filter.tradeType !== 'ALL_TRADES') {
      where.metadata = {
        path: ['action'],
        equals: filter.tradeType,
      };
    }

    return where;
  }

  private getSelectFields(): Prisma.ActionSelect {
    return {
      id: true,
      amount: true,
      createdAt: true,
      metadata: true,
      user: {
        select: {
          id: true,
          phone: true,
        },
      },
    };
  }

  private transformTransaction(action: {
    id: string;
    amount: number;
    createdAt: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    user: { id: string; phone: string };
  }): TradeTransaction {
    return {
      id: action.id,
      createdAt: action.createdAt,
      action: action.metadata?.action || 'BUY',
      goldAmount: parseFloat(BigNumber(action.amount).toFixed(2)),
      user: {
        id: action.user.id,
        phone: action.user.phone,
      },
    };
  }
}
