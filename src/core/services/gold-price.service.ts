import { Injectable } from '@nestjs/common';

@Injectable()
export class GoldPriceService {
  async getCurrentPrice() {
    return {
      pricePerGram: 2_500_000,
      expiresAt: new Date(Date.now() + 30_000),
    };
  }
}
