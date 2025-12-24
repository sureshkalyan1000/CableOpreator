"use client";

import { useState, useEffect } from "react";
import { User, UserFormData } from "./types/user";
import UserTable from "./components/UserTable";
import UserForm from "./components/UserForm";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast"; // Import Toaster component
import murugarImage from '../public/murugar.jpg';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const openDeleteModal = (id: string) => {
    setSelectedUserId(id);
    setIsDeleteOpen(true);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      // Fixed: Use toast.error instead of toast.dismiss
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreateUser = async (formData: UserFormData) => {
    try {
      setFormLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully!");
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (formData: UserFormData) => {
    if (!editingUser) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      toast.success("User updated successfully!");
      setEditingUser(null);
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setDeletingId(selectedUserId);
      const response = await fetch(`/api/users/${selectedUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      toast.success("User deleted successfully");
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
      setSelectedUserId(null);
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  // Cancel form
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Toaster component for toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-1">
              <img
                  src={murugarImage.src}
                  alt="Murugar"
                  className="h-8 w-8 object-cover rounded-full"
                />
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser || undefined}
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={handleCancelForm}
              isLoading={formLoading}
            />
          </DialogContent>
        </Dialog>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Users ({users.length})
            </h2>
            {loading && (
              <div className="flex items-center text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          ) : (
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onDelete={openDeleteModal}
              deletingId={deletingId || undefined}
            />
          )}
        </div>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Delete User
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteUser}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}