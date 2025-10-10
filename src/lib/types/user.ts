// UserForm is an interface for form input
export interface UserForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password?: string;
  confirmPassword?: string;
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
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
