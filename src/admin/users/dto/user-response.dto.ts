import { Action, Card, Wallet } from '@prisma/client';

export class UserResponseDto {
  id: string;
  phone: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  wallet?: Wallet | null;
  cards?: Card[];
  actions?: Action[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
