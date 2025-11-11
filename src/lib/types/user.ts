// UserForm is an interface for form input
export interface UserForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string;
  confirmPassword?: string;
  resellerCategoryId?: string;
}

// Profile types
export interface ResellerProfile {
  businessName?: string;
  businessType?: "offline shop" | "online store" | "groomer" | "reseller";
  socialMedia?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  shippingAddress?: {
    address?: string;
    country?: string;
    city?: string;
    district?: string;
    zipCode?: string;
  };
  taxLegalInfo?: string;
  remarks?: string;
}

export interface RetailProfile {
  address?: {
    address?: string;
    country?: string;
    city?: string;
    district?: string;
    zipCode?: string;
  };
  remarks?: string;
}

// UserData is a type that contains all the fields in the User collection.
export interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "admin" | "reseller" | "retail";
  password?: string;
  confirmPassword?: string;
  resellerProfile?: ResellerProfile;
  retailProfile?: RetailProfile;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
