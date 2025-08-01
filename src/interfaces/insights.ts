export interface ILimitOrderList {
  token: string; // Token Symbol
  orderType: string;
  price: string;
  amount: string;
  createdAt: string;
  actions: string[];
  note: string;
}