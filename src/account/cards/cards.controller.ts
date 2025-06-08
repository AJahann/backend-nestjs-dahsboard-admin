import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddCardDto } from './dto/add-card.dto';

@Controller('account/cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  addCard(@Req() req, @Body() dto: AddCardDto) {
    return this.cardsService.addCard(req.user.sub, dto);
  }

  @Delete(':cardId')
  removeCard(@Req() req, @Param('cardId') cardId: string) {
    return this.cardsService.removeCard(req.user.sub, cardId);
  }

  @Get()
  listCards(@Req() req) {
    return this.cardsService.getCards(req.user.sub);
  }
}
