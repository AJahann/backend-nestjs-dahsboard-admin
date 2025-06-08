import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAllProducts(limit: number = 15) {
    const products = await this.prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return [];
    }

    return products.map((product) => {
      return {
        ...product,
        imgData: product.imgData
          ? `data:${product.imgMimeType};base64,${Buffer.from(product.imgData).toString('base64')}`
          : null,
      };
    });
  }
}
