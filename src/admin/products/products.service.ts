import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Buffer } from 'buffer';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    let imgBuffer: Buffer | null = null;
    let imgMimeType: string | null = null;

    if (createProductDto.imgBase64) {
      try {
        const matches = createProductDto.imgBase64.match(/^data:(.+);base64,/);
        if (!matches) throw new Error('فرمت عکس نامعتبر است');

        imgMimeType = matches[1];
        const base64Data = createProductDto.imgBase64.replace(/^data:.+;base64,/, '');
        imgBuffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.log('err => ', error);
        throw new BadRequestException('فرمت عکس نامعتبر است');
      }
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        wages: createProductDto.wages,
        brand: createProductDto.brand,
        type: createProductDto.type,
        gram: createProductDto.gram,
        imgData: imgBuffer,
        imgMimeType,
      },
    });
  }

  async getAllProducts(limit: number = 15) {
    const products = await this.prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => {
      return {
        ...product,
        imgData: product.imgData
          ? `data:${product.imgMimeType};base64,${Buffer.from(product.imgData).toString('base64')}`
          : null,
      };
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.orderItem.deleteMany({ where: { productId: id } });

      try {
        await prisma.product.delete({ where: { id } });

        return {
          success: true,
          message: 'product delete successfully',
        };
      } catch (error) {
        return error;
      }
    });
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const newProductData = Object.fromEntries(
      Object.entries(updateProductDto).filter(([, value]) => value !== undefined),
    );

    return this.prisma.product.update({
      where: { id },
      data: newProductData,
    });
  }
}
