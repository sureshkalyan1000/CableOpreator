export interface User {
  _id?: string;
  name_unique: string;
  boxid: number;
  phone_number: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserFormData {
  name_unique: string;
  boxid: number;
  phone_number: string;
}