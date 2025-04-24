import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AddCardDto } from './dto/add-card.dto';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardsService {
  private readonly encryptionKey: string;
  private readonly encryptionIV: string;

  constructor(private prisma: PrismaService) {
    this.encryptionKey = process.env.ENCRYPTION_KEY!;
    this.encryptionIV = process.env.ENCRYPTION_IV!;
  }

  private encryptCardData(data: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      Buffer.from(this.encryptionIV),
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptCardData(encryptedData: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      Buffer.from(this.encryptionIV),
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async addCard(userId: string, addCardDto: AddCardDto) {
    const existingCard = await this.prisma.card.findFirst({
      where: {
        userId,
        cardNumber: this.encryptCardData(addCardDto.cardNumber),
      },
    });

    if (existingCard) {
      throw new ConflictException('این کارت قبلا ثبت شده است');
    }

    return this.prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          cardNumber: this.encryptCardData(addCardDto.cardNumber),
          cardName: addCardDto.cardName,
          userId,
        },
      });

      return {
        id: card.id,
        cardName: card.cardName,
        last4: addCardDto.cardNumber.slice(-4),
      };
    });
  }

  async removeCard(userId: string, cardId: string) {
    return this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { id: cardId, userId },
      });

      if (!card) {
        throw new NotFoundException('کارت مورد نظر یافت نشد');
      }

      await tx.card.delete({
        where: { id: cardId },
      });

      return { success: true };
    });
  }

  async getCards(userId: string) {
    const cards = await this.prisma.card.findMany({
      where: { userId },
      select: {
        id: true,
        cardName: true,
        cardNumber: true,
      },
    });

    return cards.map((card) => ({
      id: card.id,
      cardName: card.cardName,
      last4: this.decryptCardData(card.cardNumber).slice(-4),
    }));
  }
}
