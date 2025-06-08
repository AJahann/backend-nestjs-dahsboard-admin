import { Controller, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BasketService } from './basket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateBasketDto } from './dto/basket-item.dto';

@Controller('basket')
@UseGuards(JwtAuthGuard)
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post('add')
  async addToBasket(@Req() req, @Body() body: UpdateBasketDto) {
    return this.basketService.addToBasket(req.user.sub, body.productId);
  }

  @Delete('remove/:productId')
  async removeFromBasket(@Req() req, @Param('productId') productId: string) {
    return this.basketService.removeFromBasket(req.user.sub, productId);
  }

  @Delete('clear')
  async clearBasket(@Req() req) {
    return this.basketService.clearBasket(req.user.sub);
  }
}
