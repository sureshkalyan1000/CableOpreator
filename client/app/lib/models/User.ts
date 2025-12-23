import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name_unique: string;
  boxid?: number; // Made optional
  phone_number?: string; // Made optional
  place?: string; // Added new field
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name_unique: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
    },
    boxid: {
      type: Number,
      // Removed required: true to make optional
      unique: true,
      default: 0, // Set default to 0 instead of required
    },
    phone_number: {
      type: String,
      // Removed required: true to make optional
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
      trim: true,
    },
    place: {
      type: String,
      // Optional field - no required validation
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique indexes
UserSchema.index({ name_unique: 1 }, { unique: true });
UserSchema.index({ boxid: 1 }, { unique: true });

// Create text index for place if you want search functionality
UserSchema.index({ place: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
