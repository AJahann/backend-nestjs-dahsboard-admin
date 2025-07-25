import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderWithItems } from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrderCount(userId?: string): Promise<number> {
    const where = userId ? { userId } : {};
    return this.prisma.order.count({ where });
  }

  async getRecentOrders(limit = 10, userId?: string) {
    const where = userId ? { userId } : {};

    const orders = await this.prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          take: limit,
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                gram: true,
              },
            },
          },
        },
      },
    });

    const itemsInOrders = orders.flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderStatus: order.status,
        orderCreatedAt: order.createdAt,
      })),
    );

    return itemsInOrders.slice(0, limit);
  }

  async getAllOrders(userId?: string): Promise<OrderWithItems[]> {
    const where = userId ? { userId } : {};
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                gram: true,
              },
            },
          },
        },
      },
    }) as Promise<OrderWithItems[]>;
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderWithItems> {
    const isOrderExist = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!isOrderExist) {
      throw new BadRequestException('Order not found.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: updateOrderDto.status,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                gram: true,
              },
            },
          },
        },
      },
    }) as Promise<OrderWithItems>;
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                gram: true,
              },
            },
          },
        },
      },
    });

    if (order === null) {
      throw new BadRequestException('Order not found.');
    }

    return order as OrderWithItems;
  }
}
