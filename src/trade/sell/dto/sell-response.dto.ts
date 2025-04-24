export class SellGoldResponseDto {
  success: boolean;
  transactionId: string;
  grams: number;
  unitPrice: number;
  totalAmount: number;
  fee: number;
  newBalance: {
    gold: number;
    cash: number;
  };
}
