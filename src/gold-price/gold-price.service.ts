import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoldPriceDto } from './dto/create-gold-price.dto';
import { UpdateGoldPriceDto } from './dto/update-gold-price.dto';
import { GoldPrice } from './entities/gold-price.entity';

@Injectable()
export class GoldPriceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly DEFAULT_PRICES = {
    buyPrice: 7108957,
    sellPrice: 6804921,
  };

  async create(createGoldPriceDto: CreateGoldPriceDto): Promise<GoldPrice> {
    return this.prisma.goldPrice.create({
      data: createGoldPriceDto,
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

  async findAll(): Promise<GoldPrice[]> {
    return this.prisma.goldPrice.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<GoldPrice | null> {
    return this.prisma.goldPrice.findUnique({ where: { id } });
  }

  async update(id: string, updateGoldPriceDto: UpdateGoldPriceDto): Promise<GoldPrice> {
    return this.prisma.goldPrice.update({
      where: { id },
      data: updateGoldPriceDto,
    });
  }

  async remove(id: string): Promise<GoldPrice> {
    return this.prisma.goldPrice.delete({ where: { id } });
  }

  async getPriceHistory(
    limit: number = 30,
  ): Promise<Array<{ buyPrice: number; sellPrice: number; updatedAt: Date }>> {
    return this.prisma.goldPrice.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: { buyPrice: true, sellPrice: true, updatedAt: true },
    });
  }
}
