import { ITierDiscount } from "@/lib/models/ResellerCategory";

export interface ResellerCategoryForm {
  resellerCategoryName: string;
  currency: string;
  isActive: boolean;
  tierDiscount?: ITierDiscount[];
}

export interface ResellerCategoryData {
  _id: string;
  resellerCategoryName: string;
  currency: string;
  isActive: boolean;
  tierDiscount?: ITierDiscount[];
  slug: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}
