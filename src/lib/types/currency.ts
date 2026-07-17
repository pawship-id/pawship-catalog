export interface CurrencyForm {
  name: string;
  baseRupiah: number | string;
}

export interface CurrencyData {
  _id: string;
  name: string;
  baseRupiah: number;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
