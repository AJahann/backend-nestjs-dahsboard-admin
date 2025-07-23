import { Action, Card, Wallet } from '@prisma/client';

export class UserEntity {
  id: string;
  phone: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  wallet?: Wallet;
  cards?: Card[];
  actions?: Action[];
}
