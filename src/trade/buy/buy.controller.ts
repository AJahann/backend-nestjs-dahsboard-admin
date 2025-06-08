import { Controller, Post, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { BuyService } from './buy.service';
import { BuyGoldDto } from './dto/buy.dto';
import { BuyGoldResponseDto } from './dto/buy-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('trade/buy')
@UseGuards(JwtAuthGuard)
export class BuyController {
  constructor(private readonly buyService: BuyService) {}

  @Post()
  @HttpCode(200)
  async buyGold(@Req() req, @Body() buyGoldDto: BuyGoldDto): Promise<BuyGoldResponseDto> {
    return this.buyService.buyGold(req.user.sub, buyGoldDto.amount);
  }
}
