import { Injectable } from '@nestjs/common';

@Injectable()
export class GoldPriceService {
  async getCurrentPrice() {
    return {
      pricePerGram: 6_540_824, // ۶,۵۴۰,۸۲۴
      expiresAt: new Date(Date.now() + 30_000),
    };
  }
}
