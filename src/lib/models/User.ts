import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import softDelete from "mongoose-delete";
import crypto from "crypto";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: "admin" | "reseller" | "retail";
  profile: {
    name: string;
  };
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please input an username"],
      unique: [true, "Username already exists"],
    },
    email: {
      type: String,
      required: [true, "Please input an email"],
      match: [/.+@.+\..+/, "Invalid email format"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Please input a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "reseller", "retail"],
      default: "retail",
    },
    profile: {
      name: {
        type: String,
        required: false,
      },
    },
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
