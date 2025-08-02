import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoldPriceDto } from './dto/create-gold-price.dto';
import { GoldPrice } from './entities/gold-price.entity';

@Injectable()
export class GoldPriceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly DEFAULT_PRICES = {
    buyPrice: 7108957,
    sellPrice: 6804921,
  };

  async create(adminId: number, createGoldPriceDto: CreateGoldPriceDto): Promise<GoldPrice> {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    return this.prisma.goldPrice.create({
      data: {
        buyPrice: createGoldPriceDto.buyPrice,
        sellPrice: createGoldPriceDto.sellPrice,
        updatedBy: `${admin.name} ${admin.lastName}`,
      },
    });
  }

  async initializeDefaultPrices() {
    const goldPriceCount = await this.prisma.goldPrice.count();
    if (goldPriceCount === 0) {
      await this.prisma.goldPrice.create({
        data: {
          buyPrice: this.DEFAULT_PRICES.buyPrice,
          sellPrice: this.DEFAULT_PRICES.sellPrice,
          updatedBy: 'system-init',
        },
      });
    }
  }

  async getLatestPrices(): Promise<{ buyPrice: number; sellPrice: number }> {
    const latest = await this.prisma.goldPrice.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { buyPrice: true, sellPrice: true },
    });

    return latest ?? this.DEFAULT_PRICES;
  }

  async getPriceHistory(limit: number = 30): Promise<GoldPrice[]> {
    return this.prisma.goldPrice.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
  }
}
