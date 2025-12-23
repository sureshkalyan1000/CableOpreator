export interface User {
  _id: string;
  name_unique: string;
  boxid?: number; // Made optional
  phone_number?: string; // Made optional
  place?: string; // Added new field
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name_unique: string;
  boxid?: number;
  phone_number?: string;
  place?: string;
}
