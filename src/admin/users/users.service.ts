import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserPaginatedResponse } from './interfaces/user-paginated.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CardsService } from 'src/account/cards/cards.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cardsService: CardsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('creat user error: this account already exist.');
    }

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        phone: createUserDto.phone,
        password: await bcrypt.hash(createUserDto.password, 10),
        wallet: {
          create: {
            goldAmount: 0,
            cashBalance: 0,
          },
        },
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<UserPaginatedResponse> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          wallet: true,
          actions: true,
          cards: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    const usersWithCards = await Promise.all(
      users.map(async (user) => {
        const cards = user.cards.map((card) => ({
          ...card,
          cardNumber: this.cardsService.decryptCardData(card.cardNumber),
        }));

        return {
          ...user,
          cards,
        };
      }),
    );

    const formattedUsers = usersWithCards.map((user) => new UserResponseDto(user));

    const totalPages = Math.ceil(total / limit);

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        cards: true,
        actions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const newData = {
      ...(updateUserDto.name && { name: updateUserDto?.name }),
      ...(updateUserDto.phone && { phone: updateUserDto?.phone }),
      ...(updateUserDto?.password && { password: await bcrypt.hash(updateUserDto.password, 10) }),
    };

    const user = await this.prisma.user.update({
      where: { id },
      data: newData,
      include: {
        wallet: true,
        cards: true,
        actions: true,
      },
    });

    return new UserResponseDto(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.basketItem.deleteMany({ where: { userId: id } });
      await prisma.action.deleteMany({ where: { userId: id } });
      await prisma.card.deleteMany({ where: { userId: id } });
      await prisma.wallet.deleteMany({ where: { userId: id } });
      await prisma.orderItem.deleteMany({ where: { order: { userId: id } } });
      await prisma.order.deleteMany({ where: { userId: id } });

      try {
        await prisma.user.delete({ where: { id } });

        return {
          success: true,
        };
      } catch (error) {
        console.error('Error deleting user:', error);
        return {
          success: false,
        };
      }
    });
  }

  async getTotalUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
