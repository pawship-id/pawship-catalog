export interface CategoryForm {
  name: string;
  image: File | string | null;
  isDisplayed: boolean;
  description: string;
  isSubCategory: boolean;
  parentCategoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string; // secureUrl
  description: string;
  isDisplayed: boolean;
  imagePublicId?: string;
  isSubCategory?: boolean;
  parentCategoryId?: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
