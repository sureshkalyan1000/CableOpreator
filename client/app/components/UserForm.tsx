"use client";

import React, { useState } from "react";
import { User, UserFormData } from "../types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name_unique: user?.name_unique || "",
    boxid: user?.boxid || 0,
    phone_number: user?.phone_number || "",
    place: user?.place || "",
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Only name is required
    if (!formData.name_unique.trim()) {
      newErrors.name_unique = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Remove place if empty
    const submitData = { ...formData };
    if (!submitData.place?.trim()) {
      delete submitData.place;
    }

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "boxid" ? parseInt(value) || 0 : value,
    }));

    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user ? "Edit User" : "Create New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_unique">Unique Name *</Label>
            <Input
              id="name_unique"
              name="name_unique"
              value={formData.name_unique}
              onChange={handleChange}
              placeholder="Enter unique name"
              className={errors.name_unique ? "border-red-500" : ""}
            />
            {errors.name_unique && (
              <p className="text-sm text-red-600">{errors.name_unique}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="boxid">Box ID *</Label>
            <Input
              id="boxid"
              name="boxid"
              type="number"
              value={formData.boxid || ""}
              onChange={handleChange}
              placeholder="Enter box ID"
              min="0"
              className={errors.boxid ? "border-red-500" : ""}
            />
            {errors.boxid && (
              <p className="text-sm text-red-600">{errors.boxid}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={errors.phone_number ? "border-red-500" : ""}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-600">{errors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Place</Label>
            <Input
              id="place"
              name="place"
              value={formData.place || ""}
              onChange={handleChange}
              placeholder="Enter place"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
