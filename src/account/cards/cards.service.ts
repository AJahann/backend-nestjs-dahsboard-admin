import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddCardDto } from './dto/add-card.dto';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardsService {
  private readonly encryptionKey: Buffer;
  private readonly encryptionIV: Buffer;

  constructor(private prisma: PrismaService) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }

    if (!process.env.ENCRYPTION_IV) {
      throw new Error('ENCRYPTION_IV must be set in environment variables');
    }

    this.encryptionKey = this.parseCryptoBuffer(process.env.ENCRYPTION_KEY, 32, 'Encryption key');
    this.encryptionIV = this.parseCryptoBuffer(
      process.env.ENCRYPTION_IV,
      16,
      'Initialization vector',
    );
  }

  private parseCryptoBuffer(value: string, expectedLength: number, name: string): Buffer {
    if (/^[0-9a-fA-F]+$/.test(value)) {
      const buffer = Buffer.from(value, 'hex');
      if (buffer.length === expectedLength) return buffer;
    }

    if (/^[A-Za-z0-9+/=]+$/.test(value)) {
      const buffer = Buffer.from(value, 'base64');
      if (buffer.length === expectedLength) return buffer;
    }

    const utf8Buffer = Buffer.from(value, 'utf8');
    if (utf8Buffer.length === expectedLength) return utf8Buffer;

    throw new Error(
      `${name} must be ${expectedLength} bytes. ` +
        `Current length: ${utf8Buffer.length} bytes. ` +
        `Provide as hex (${expectedLength * 2} chars), ` +
        `base64 (${Math.ceil((expectedLength * 4) / 3)} chars), ` +
        `or UTF-8 (${expectedLength} chars)`,
    );
  }

  private encryptCardData(data: string): string {
    if (!data) {
      throw new InternalServerErrorException('Card data cannot be empty');
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.encryptionIV);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptCardData(encryptedData: string): string {
    if (!encryptedData) {
      throw new InternalServerErrorException('Encrypted data cannot be empty');
    }

    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey, // Already a Buffer
        this.encryptionIV, // Already a Buffer
      );

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new InternalServerErrorException('Failed to decrypt card data');
    }
  }

  async addCard(userId: string, addCardDto: AddCardDto) {
    const userCardsCount = await this.prisma.card.count({ where: { userId } });

    if (userCardsCount >= 5) {
      throw new ConflictException('حداکثر تعداد کارت های شما ۵ عدد است');
    }

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

    return cards.map((card) => {
      try {
        const decryptedNumber = this.decryptCardData(card.cardNumber);
        return {
          id: card.id,
          cardName: card.cardName,
          last4: decryptedNumber.slice(-4),
        };
      } catch (error) {
        console.error(`Error decrypting card ${card.id}:`, error);
        return {
          id: card.id,
          cardName: card.cardName,
          last4: '****',
        };
      }
    });
  }
}
