"use client";

import React, { useState, useMemo } from "react";
import { User } from "../types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  User as UserIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  deletingId?: string;
}

// Filter field options
type FilterField = "all" | "name" | "boxid" | "phone" | "place";

export default function UserTable({
  users,
  onEdit,
  onDelete,
  deletingId,
}: UserTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState<FilterField>("name");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    boxid: "",
    phone: "",
    place: "",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Function to navigate to user details page
  const handleViewDetails = (userId: string) => {
    router.push(`/details/${userId}`);
  };

  // Advanced filtering function
  const filteredUsers = useMemo(() => {
    // If using simple search
    if (!showAdvancedFilters && search) {
      return users.filter((user) => {
        const searchLower = search.toLowerCase();

        if (filterField === "all") {
          return (
            user.name_unique.toLowerCase().includes(searchLower) ||
            user.boxid?.toString().includes(search) ||
            user.phone_number?.toLowerCase().includes(searchLower) ||
            user.place?.toLowerCase().includes(searchLower)
          );
        } else if (filterField === "name") {
          return user.name_unique.toLowerCase().includes(searchLower);
        } else if (filterField === "boxid") {
          return user.boxid?.toString().includes(search);
        } else if (filterField === "phone") {
          return user.phone_number?.toLowerCase().includes(searchLower);
        } else if (filterField === "place") {
          return user.place?.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    // If using advanced filters
    if (showAdvancedFilters) {
      return users.filter((user) => {
        const nameMatch =
          !advancedFilters.name ||
          user.name_unique
            .toLowerCase()
            .includes(advancedFilters.name.toLowerCase());

        const boxidMatch =
          !advancedFilters.boxid ||
          user.boxid?.toString().includes(advancedFilters.boxid);

        const phoneMatch =
          !advancedFilters.phone ||
          user.phone_number
            ?.toLowerCase()
            .includes(advancedFilters.phone.toLowerCase());

        const placeMatch =
          !advancedFilters.place ||
          user.place
            ?.toLowerCase()
            .includes(advancedFilters.place.toLowerCase());

        return nameMatch && boxidMatch && phoneMatch && placeMatch;
      });
    }

    // No filters applied
    return users;
  }, [users, search, filterField, showAdvancedFilters, advancedFilters]);

  const handleAdvancedFilterChange = (
    field: keyof typeof advancedFilters,
    value: string
  ) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      name: "",
      boxid: "",
      phone: "",
      place: "",
    });
  };

  const clearSimpleSearch = () => {
    setSearch("");
  };

  // Check if any advanced filter is active
  const isAdvancedFilterActive = Object.values(advancedFilters).some(
    (value) => value.trim() !== ""
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="space-y-4">
        {/* Simple Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 flex items-center gap-2">
            {/* Show/Hide Details Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllDetails(!showAllDetails)}
              className="flex items-center gap-2"
            >
              {showAllDetails ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Columns
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  All Columns
                </>
              )}
            </Button>
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <Input
              placeholder={`Search by ${filterField === "all" ? "all fields" : filterField
                }...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearSimpleSearch}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filterField}
              onValueChange={(value: FilterField) => setFilterField(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="boxid">Box ID</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="place">Place</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="shrink-0"
              title={
                showAdvancedFilters
                  ? "Hide advanced filters"
                  : "Show advanced filters"
              }
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Advanced Filters
              </h3>
              <div className="flex items-center gap-2">
                {isAdvancedFilterActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAdvancedFilters}
                    className="h-8 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Name
                </label>
                <Input
                  placeholder="Filter by name..."
                  value={advancedFilters.name}
                  onChange={(e) =>
                    handleAdvancedFilterChange("name", e.target.value)
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Box ID
                </label>
                <Input
                  placeholder="Filter by Box ID..."
                  value={advancedFilters.boxid}
                  onChange={(e) =>
                    handleAdvancedFilterChange("boxid", e.target.value)
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Phone
                </label>
                <Input
                  placeholder="Filter by phone..."
                  value={advancedFilters.phone}
                  onChange={(e) =>
                    handleAdvancedFilterChange("phone", e.target.value)
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Place
                </label>
                <Input
                  placeholder="Filter by place..."
                  value={advancedFilters.place}
                  onChange={(e) =>
                    handleAdvancedFilterChange("place", e.target.value)
                  }
                  className="h-9"
                />
              </div>
            </div>

            {isAdvancedFilterActive && (
              <div className="text-xs text-gray-500 pt-2">
                Active filters:{" "}
                {Object.entries(advancedFilters)
                  .filter(([_, value]) => value.trim() !== "")
                  .map(([key]) => key)
                  .join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
            {!showAllDetails && " (compact view)"}
          </span>
          <div className="flex items-center gap-2">
            {(search || isAdvancedFilterActive) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSimpleSearch();
                  clearAdvancedFilters();
                }}
                className="text-xs h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all filters
              </Button>
            )}
            {!showAllDetails && (
              <Badge variant="secondary" className="text-xs">
                Compact View
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Box ID</TableHead>
              {showAllDetails && (
                <>
                  <TableHead>Phone</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Created</TableHead>
                </>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showAllDetails ? 7 : 4}
                  className="text-center py-8 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">No users found</p>
                      <p className="text-sm text-gray-500">
                        {search || isAdvancedFilterActive
                          ? "Try changing your search or filters"
                          : "No users in the database"}
                      </p>
                    </div>
                    {(search || isAdvancedFilterActive) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearSimpleSearch();
                          clearAdvancedFilters();
                        }}
                        className="mt-2"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleViewDetails(user._id!)}
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      title="View full details"
                    >
                      <UserIcon className="h-3 w-3" />
                      {user.name_unique}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          user.boxid && copyToClipboard(user.boxid.toString())
                        }
                        title="Copy ID"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>

                      {user.boxid ? (
                        <span className="flex items-center gap-2">
                          {user.boxid.toString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </div>
                  </TableCell>
                  {showAllDetails && (
                    <>
                      <TableCell>
                        {user.phone_number || (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.place ? (
                          <Badge variant="outline">{user.place}</Badge>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt!).toLocaleDateString()}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user._id!)}
                        disabled={deletingId === user._id}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}