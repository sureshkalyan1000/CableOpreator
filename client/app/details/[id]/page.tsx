"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Box, Copy, Edit, 
  ChevronDown, ChevronUp, Smartphone, Monitor, Plus, Trash2, 
  DollarSign, FileText, IndianRupee, Receipt, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserDetails {
  _id: string;
  name_unique: string;
  phone_number: string;
  place: string;
  boxid: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Payment {
  _id: string;
  userId: string;
  payFor: string; // Date string
  payDate: string; // Date string
  paid: number;
  balance: number;
  createdAt?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isDeletePaymentOpen, setIsDeletePaymentOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    payFor: "",
    payDate: new Date().toISOString().split('T')[0],
    paid: "",
    balance: ""
  });

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      const data = await response.json();
      setUser(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load user details");
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments sorted by payFor (most recent first)
  const fetchPayments = async () => {
    if (!params.id) return;
    
    try {
      setPaymentsLoading(true);
      const response = await fetch(`/api/payments?userId=${params.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort payments by payFor date (most recent first)
      const sortedPayments = data.sort((a: Payment, b: Payment) => {
        return new Date(b.payFor).getTime() - new Date(a.payFor).getTime();
      });
      
      setPayments(sortedPayments);
    } catch (error: any) {
      toast.error(error.message || "Failed to load payments");
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchUserDetails();
      fetchPayments();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Format date for input field (YYYY-MM)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Format date for date input (YYYY-MM-DD)
  const formatDateForDateInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalBalance = payments.reduce((sum, payment) => sum + payment.balance, 0);

  // Add new payment
  const handleAddPayment = async () => {
    if (!user) return;

    try {
      setFormLoading(true);

      // Validate form
      if (!paymentForm.payFor || !paymentForm.paid) {
        toast.error("Please fill in all required fields");
        return;
      }

      const paymentData = {
        userId: user._id,
        payFor: paymentForm.payFor + "-01", // Add day for date format
        payDate: paymentForm.payDate,
        paid: Number(paymentForm.paid),
        balance: paymentForm.balance ? Number(paymentForm.balance) : 0
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add payment');
      }

      toast.success('Payment added successfully!');
      setIsAddPaymentOpen(false);
      resetPaymentForm();
      fetchPayments(); // Refresh payments list
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error adding payment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit payment
  const handleEditPayment = async () => {
    if (!editingPayment) return;

    try {
      setFormLoading(true);

      // Validate form
      if (!paymentForm.payFor || !paymentForm.paid) {
        toast.error("Please fill in all required fields");
        return;
      }

      const paymentData = {
        payFor: paymentForm.payFor + "-01",
        payDate: paymentForm.payDate,
        paid: Number(paymentForm.paid),
        balance: paymentForm.balance ? Number(paymentForm.balance) : 0
      };

      const response = await fetch(`/api/payments/${editingPayment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment');
      }

      toast.success('Payment updated successfully!');
      setIsEditPaymentOpen(false);
      setEditingPayment(null);
      resetPaymentForm();
      fetchPayments(); // Refresh payments list
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error updating payment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async () => {
    if (!selectedPaymentId) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/payments/${selectedPaymentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment');
      }

      toast.success('Payment deleted successfully!');
      setIsDeletePaymentOpen(false);
      setSelectedPaymentId(null);
      fetchPayments(); // Refresh payments list
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error deleting payment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      payFor: "",
      payDate: new Date().toISOString().split('T')[0],
      paid: "",
      balance: ""
    });
  };

  const openEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      payFor: formatDateForInput(payment.payFor),
      payDate: formatDateForDateInput(payment.payDate),
      paid: payment.paid.toString(),
      balance: payment.balance.toString()
    });
    setIsEditPaymentOpen(true);
  };

  const openDeletePayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeletePaymentOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800">User not found</h2>
          <p className="mt-2 text-gray-600 text-sm">The user you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 gap-2 w-full"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payFor">Payment For (Month & Year)*</Label>
              <Input
                id="payFor"
                type="month"
                value={paymentForm.payFor}
                onChange={(e) => setPaymentForm({...paymentForm, payFor: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payDate">Payment Date</Label>
              <Input
                id="payDate"
                type="date"
                value={paymentForm.payDate}
                onChange={(e) => setPaymentForm({...paymentForm, payDate: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="paid">Amount Paid (₹)*</Label>
              <Input
                id="paid"
                type="number"
                value={paymentForm.paid}
                onChange={(e) => setPaymentForm({...paymentForm, paid: e.target.value})}
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="balance">Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                value={paymentForm.balance}
                onChange={(e) => setPaymentForm({...paymentForm, balance: e.target.value})}
                placeholder="Enter balance (if any)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddPaymentOpen(false);
                resetPaymentForm();
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={formLoading}>
              {formLoading ? "Adding..." : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editPayFor">Payment For (Month & Year)*</Label>
              <Input
                id="editPayFor"
                type="month"
                value={paymentForm.payFor}
                onChange={(e) => setPaymentForm({...paymentForm, payFor: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editPayDate">Payment Date</Label>
              <Input
                id="editPayDate"
                type="date"
                value={paymentForm.payDate}
                onChange={(e) => setPaymentForm({...paymentForm, payDate: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editPaid">Amount Paid (₹)*</Label>
              <Input
                id="editPaid"
                type="number"
                value={paymentForm.paid}
                onChange={(e) => setPaymentForm({...paymentForm, paid: e.target.value})}
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editBalance">Balance (₹)</Label>
              <Input
                id="editBalance"
                type="number"
                value={paymentForm.balance}
                onChange={(e) => setPaymentForm({...paymentForm, balance: e.target.value})}
                placeholder="Enter balance (if any)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditPaymentOpen(false);
                setEditingPayment(null);
                resetPaymentForm();
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPayment} disabled={formLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {formLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={isDeletePaymentOpen} onOpenChange={setIsDeletePaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this payment? This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeletePaymentOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePayment} 
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? "Deleting..." : "Delete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {user.name_unique}
                </h1>
                <p className="text-xs text-gray-500">User Details & Payments</p>
              </div>
            </div>
            
            {/* <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/edit/${params.id}`)}
                className="h-9 w-9"
                title="Edit User"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div> */}
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* User Details Section */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          {/* Header - Always visible */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">User Information</h2>
                  <p className="text-xs text-gray-500">Click to {isExpanded ? 'collapse' : 'expand'} details</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Stats - Always visible */}
            {isExpanded && (<div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Box className="h-3 w-3" />
                  <span className="text-xs font-medium">Box ID</span>
                </div>
                <div className="mt-1 text-lg font-bold">{user.boxid}</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Phone className="h-3 w-3" />
                  <span className="text-xs font-medium">Phone</span>
                </div>
                <div className="mt-1 text-sm font-medium truncate">
                  {user.phone_number || "Not set"}
                </div>
              </div>
            </div>)}
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t">
              <div className="space-y-3 mt-4">
                {/* Name */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Full Name</div>
                      <div className="font-medium">{user.name_unique}</div>
                    </div>
                  </div>
                </div>

                {/* Box ID */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Box className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Box ID</div>
                      <div className="font-medium font-mono">{user.boxid}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(user.boxid.toString());
                      toast.success("Box ID copied!");
                    }}
                    className="h-8 w-8"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Phone Number</div>
                      <div className="font-medium">{user.phone_number || "-"}</div>
                    </div>
                  </div>
                  {user.phone_number && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(user.phone_number);
                        toast.success("Phone copied!");
                      }}
                      className="h-8 w-8"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Place */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Place</div>
                      <div className="font-medium">{user.place || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payments Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">Payment History</h2>
                  <p className="text-xs text-gray-500">
                    {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded • Sorted by Month/Year
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsAddPaymentOpen(true)}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            {paymentsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-600">No payments recorded yet</p>
                <Button
                  onClick={() => setIsAddPaymentOpen(true)}
                  className="mt-4 gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add First Payment
                </Button>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-1">
                          Pay For
                          <span className="text-xs text-gray-500">▼</span>
                        </div>
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Entered Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Paid (₹)</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Balance (₹)</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{formatMonthYear(payment.payFor)}</div>
                          {/* <div className="text-xs text-gray-500 mt-1">
                            {new Date(payment.payFor).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: '2-digit' 
                            })}
                          </div> */}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(payment.payDate)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-3 w-3 text-green-600" />
                            <span className="font-medium">{payment.paid.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-2 ${payment.balance < 0 ? 'text-red-600' : payment.balance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            <IndianRupee className="h-3 w-3" />
                            <span className="font-medium">{payment.balance.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditPayment(payment)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-800"
                              title="Edit Payment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeletePayment(payment._id)}
                              className="h-8 w-8 text-red-600 hover:text-red-800"
                              title="Delete Payment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-4" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span>TOTAL</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <IndianRupee className="h-4 w-4" />
                          <span>{totalPaid.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 ${totalBalance < 0 ? 'text-red-700' : totalBalance > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                          <IndianRupee className="h-4 w-4" />
                          <span>{totalBalance.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4"></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Summary Cards */}
          {payments.length > 0 && (
            <div className="p-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-700">Total Payments</div>
                  <div className="text-2xl font-bold mt-1">{payments.length}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700">Total Paid</div>
                  <div className="text-2xl font-bold mt-1 flex items-center">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {totalPaid.toLocaleString()}
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${totalBalance < 0 ? 'bg-red-50' : totalBalance > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${totalBalance < 0 ? 'text-red-700' : totalBalance > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                    {totalBalance < 0 ? 'Total Due' : totalBalance > 0 ? 'Total Balance' : 'Net Balance'}
                  </div>
                  <div className={`text-2xl font-bold mt-1 flex items-center ${totalBalance < 0 ? 'text-red-600' : totalBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {Math.abs(totalBalance).toLocaleString()}
                    {totalBalance === 0 && ' (Clear)'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">       
          <Button
            variant="outline"
            onClick={() => {
              // Generate payment summary
              const summary = `Payment Summary for ${user.name_unique}\n\n` +
                payments.map(p => 
                  `${formatMonthYear(p.payFor)}: ₹${p.paid} paid, Balance: ₹${p.balance}`
                ).join('\n') +
                `\n\nTotal Paid: ₹${totalPaid}\nNet Balance: ₹${totalBalance}`;
              
              navigator.clipboard.writeText(summary);
              toast.success("Payment summary copied!");
            }}
            className="gap-2 flex-1"
          >
            <FileText className="h-4 w-4" />
            Copy Summary
          </Button>
        </div>

        {/* Device Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Smartphone className="h-4 w-4 md:hidden" />
            <Monitor className="h-4 w-4 hidden md:inline" />
            <span className="md:hidden">Mobile View</span>
            <span className="hidden md:inline">Desktop View</span>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setIsAddPaymentOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}