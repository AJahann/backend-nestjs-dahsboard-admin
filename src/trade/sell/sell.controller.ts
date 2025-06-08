import { Controller, Post, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { SellService } from './sell.service';
import { SellGoldDto } from './dto/sell.dto';
import { SellGoldResponseDto } from './dto/sell-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('trade/sell')
@UseGuards(JwtAuthGuard)
export class SellController {
  constructor(private readonly sellService: SellService) {}

  @Post()
  @HttpCode(200)
  async sellGold(@Req() req, @Body() sellGoldDto: SellGoldDto): Promise<SellGoldResponseDto> {
    return this.sellService.sellGold(req.user.sub, sellGoldDto);
  }
}
