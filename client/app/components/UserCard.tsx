"use client";

import React from "react";
import { User } from "../types/user";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Mail, Phone, Box, Calendar } from "lucide-react";
import { toast } from "react-hot-toast"; 

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function UserCard({
  user,
  onEdit,
  onDelete,
  isDeleting,
}: UserCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
 toast.success("Copied to clipboard!");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {user.name_unique}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                ID: {user._id?.substring(0, 8)}...
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => user._id && copyToClipboard(user._id)}
                title="Copy ID"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              title="Edit user"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user._id!)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Box className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <span className="text-sm text-gray-600">Box ID:</span>
            <span className="ml-2 font-medium">
              {user.boxid || (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <span className="text-sm text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">
              {user.phone_number || (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </span>
          </div>
        </div>

        {user.place && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">Place:</span>
              <Badge variant="outline" className="ml-2">
                {user.place}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Created: {new Date(user.createdAt!).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
