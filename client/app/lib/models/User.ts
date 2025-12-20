import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name_unique: string;
  boxid: number;
  phone_number: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name_unique: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true,
  },
  boxid: {
    type: Number,
    required: [true, 'Box ID is required'],
    unique: true,
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
  },
}, {
  timestamps: true,
});

// Create unique indexes
UserSchema.index({ name_unique: 1 }, { unique: true });
UserSchema.index({ boxid: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);