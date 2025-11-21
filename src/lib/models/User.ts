import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import softDelete from "mongoose-delete";
import crypto from "crypto";

// Profile interfaces based on role
export interface IResellerProfile {
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
  taxLegalInfo?: string; // Optional, hidden for now
  remarks?: string; // For internal use
}

export interface IRetailProfile {
  address?: {
    address?: string;
    country?: string;
    city?: string;
    district?: string;
    zipCode?: string;
  };
  remarks?: string; // For internal use
}

export interface IAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: "admin" | "reseller" | "retail";
  resellerCategoryId?: Types.ObjectId;
  resellerProfile?: IResellerProfile;
  retailProfile?: IRetailProfile;
  addresses?: IAddress[];
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Please input a full name"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please input a phone number"],
      maxLength: [25, "Phone number cannot exceed 25 characters"],
    },
    email: {
      type: String,
      required: [true, "Please input an email"],
      match: [/.+@.+\..+/, "Invalid email format"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please input a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "reseller", "retail"],
        message: "Role must be one of: admin, reseller, or retail",
      },
      default: "retail",
    },
    resellerCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "ResellerCategory",
      required: false,
    },
    resellerProfile: {
      businessName: { type: String },
      businessType: {
        type: String,
        enum: ["offline shop", "online store", "groomer", "reseller"],
      },
      socialMedia: {
        instagram: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
      },
      shippingAddress: {
        address: { type: String },
        country: { type: String },
        city: { type: String },
        district: { type: String },
        zipCode: { type: String },
      },
      taxLegalInfo: { type: String },
      remarks: { type: String },
    },
    retailProfile: {
      address: {
        address: { type: String },
        country: { type: String },
        city: { type: String },
        district: { type: String },
        zipCode: { type: String },
      },
      remarks: { type: String },
    },
    addresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true, default: "Indonesia" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// mongoose-delete plugin for soft delete
UserSchema.plugin(softDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

UserSchema.virtual("confirmPassword")
  .get(function () {
    // @ts-ignore
    return this._confirmPassword;
  })
  .set(function (value) {
    // @ts-ignore
    this._confirmPassword = value;
  });

// middleware to encrypt passwords before they are stored
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (!this.confirmPassword) {
    return next(
      this.invalidate("confirmPassword", "Please input a confirm password")
    );
  }

  if (this.password !== this.confirmPassword) {
    return next(this.invalidate("confirmPassword", "Passwords do not match"));
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// method to create password reset token
UserSchema.methods.createPasswordResetToken = function () {
  // create random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // encrypt tokens before storing them in the database (optional)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set an expiration date (e.g., 1 hour from now)
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  // return the original unencrypted token to be sent via email.
  return resetToken;
};

UserSchema.virtual("resellerSchema", {
  ref: "ResellerCategory",
  localField: "resellerCategoryId",
  foreignField: "_id",
  justOne: true,
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
