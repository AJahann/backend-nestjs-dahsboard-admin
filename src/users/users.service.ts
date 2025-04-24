import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        phone: createUserDto.phone,
        password: createUserDto.password,
        wallet: {
          create: {
            goldAmount: 0,
            cashBalance: 0,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        wallet: true,
        cards: true,
        basket: true,
        actions: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        cards: true,
        basket: true,
        actions: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async addCard(userId: string, cardData: { cardNumber: string; cardName: string }) {
    await this.findById(userId);
    return this.prisma.card.create({
      data: {
        ...cardData,
        userId,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.card.deleteMany({ where: { userId: id } });
    await this.prisma.wallet.delete({ where: { userId: id } });
    await this.prisma.action.deleteMany({ where: { userId: id } });

    return this.prisma.user.delete({
      where: { id },
      include: {
        wallet: true,
        cards: true,
      },
    });
  }
}
