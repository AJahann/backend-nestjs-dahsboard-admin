import { Injectable } from '@nestjs/common';
import { UpdateGoldPriceDto } from './dto/update-gold-price.dto';
import { TradeActionType, TransactionFilterDto } from './dto/transaction-filter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoldPriceService } from 'src/gold-price/gold-price.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private goldPriceService: GoldPriceService,
  ) {}

  async getCurrentGoldPrices() {
    const latest = await this.prisma.goldPrice.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
      },
    });

    if (latest) {
      return this.prisma.goldPrice.findUnique({
        where: { id: latest.id },
        select: {
          id: true,
          buyPrice: true,
          sellPrice: true,
          updatedAt: true,
          updatedBy: true,
        },
      });
    }

    await this.goldPriceService.initializeDefaultPrices();

    return this.prisma.goldPrice.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        buyPrice: true,
        sellPrice: true,
        updatedAt: true,
        updatedBy: true,
      },
    });
  }

  async updateGoldPrices(adminId: number, dto: UpdateGoldPriceDto) {
    const adminName = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { name: true },
    });

    if (adminName == null) {
      throw new Error('Admin not found');
    }

    return this.prisma.goldPrice.create({
      data: {
        buyPrice: dto.buyPrice,
        sellPrice: dto.sellPrice,
        updatedBy: adminName.name,
      },
    });
  }

  async getTradeTransactions(filter: TransactionFilterDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
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

    if (filter.tradeType && filter.tradeType !== TradeActionType.ALL_TRADES) {
      where.metadata.path = ['action'];
      where.metadata.equals = filter.tradeType;
    }

    return this.prisma.action.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async getPriceHistory() {
    return this.prisma.goldPrice.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: {
        buyPrice: true,
        sellPrice: true,
        updatedAt: true,
        updatedBy: true,
      },
    });
  }
}
