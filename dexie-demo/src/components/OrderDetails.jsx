// src/pages/OrderDetail.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
  User,
  CreditCard,
  ShoppingBag,
  FileText,
  Download,
  X,
} from "lucide-react";
import db from "../db/db";
import html2pdf from "html2pdf.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `invoice_${order.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || "null"
    );
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      try {
        const orderData = await db.orders.get(Number(id));
        if (!orderData) {
          setError("Order not found");
          return;
        }

        const userData = orderData.userId
          ? await db.users.get(orderData.userId)
          : null;

        setOrder(orderData);
        setUser(userData);
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusConfig = (status = "pending") => {
    const map = {
      pending: {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        icon: Clock,
      },
      confirmed: {
        label: "Confirmed",
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
        icon: CheckCircle,
      },
      processing: {
        label: "Processing",
        bg: "bg-gray-50",
        text: "text-gray-800",
        border: "border-gray-300",
        icon: RefreshCw,
      },
      shipped: {
        label: "Shipped",
        bg: "bg-slate-50",
        text: "text-slate-800",
        border: "border-slate-300",
        icon: Truck,
      },
      delivered: {
        label: "Delivered",
        bg: "bg-green-50",
        text: "text-green-800",
        border: "border-green-200",
        icon: Package,
      },
      cancelled: {
        label: "Cancelled",
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
        icon: AlertCircle,
      },
    };

    return map[status.toLowerCase()] || map.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#131921] h-16" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-72 mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "We couldn't find this order."}
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#FF9900] hover:bg-[#FFB84D] text-black font-medium px-8"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Amazon-style header bar */}
      <header className="bg-[#131921] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#232F3E] "
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold">
                Order #{order.id}
              </h3>
              <p className="text-sm text-gray-300 mt-0.5">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <Button
              className="bg-[#FF9900] hover:bg-[#FFB84D] text-black font-medium gap-2"
              onClick={() => setShowInvoice(true)}
            >
              <FileText className="h-4 w-4" />
              View Invoice
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & date */}
            <Card
              className="border-gray-200 shadow-sm"
              style={{ padding: "10px", marginTop: "10px", marginLeft: "10px" }}
            >
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order placed</p>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-5 py-2 text-base font-medium border-2",
                      status.bg,
                      status.text,
                      status.border
                    )}
                  >
                    <status.icon className="mr-2 h-5 w-5" />
                    {status.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card
              className="border-gray-200 shadow-sm overflow-hidden"
              style={{ padding: "10px", marginTop: "10px", marginLeft: "10px" }}
            >
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  Order Items ({order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {order.items?.length ? (
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-5">
                          {/* Image placeholder */}
                          <div className="flex-shrink-0 w-28 h-28 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                            <Package className="h-10 w-10 text-gray-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-[#0066C0] hover:text-[#C7511F] hover:underline cursor-pointer">
                              {item.name || item.title || "Item"}
                            </h3>
                            {item.variant && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.variant}
                              </p>
                            )}
                            <p className="mt-2 text-sm text-gray-600">
                              Qty:{" "}
                              <span className="font-medium">
                                {item.quantity || 1}
                              </span>
                            </p>
                          </div>

                          <div className="text-right whitespace-nowrap">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.price || 0).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Total: ₹
                                {((item.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-gray-500">
                    No items found in this order
                  </div>
                )}

                {/* Totals summary (bottom of items card) */}
                <div className="p-6 bg-gray-50 border-t">
                  <div className="max-w-md ml-auto space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        ₹{(order.subtotal || order.total || 0).toFixed(2)}
                      </span>
                    </div>
                    {order.shippingFee !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Shipping</span>
                        <span>₹{order.shippingFee.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-gray-900">
                        Order Total
                      </span>
                      <span className="text-2xl font-bold text-[#B12704]">
                        ₹{order.total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6conif">
            {/* Payment & Status quick view */}
            <Card
              className="border-gray-200 shadow-sm"
              style={{ padding: "10px", marginTop: "10px" }}
            >
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </p>

                    <span
                      className={cn(
                        "inline-flex w-fit items-center  px-3 py-1 text-sm font-semibold",
                        status.text,
                        status.border,
                        status.bg
                      )}
                    >
                      {order.paymentStatus
                        ? order.paymentStatus.replace("_", " ")
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card
              className="border-gray-200 shadow-sm"
              style={{ padding: "10px", marginTop: "10px" }}
            >
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent
                className="p-6 text-sm space-y-2 text-gray-700"
                style={{ marginbottom: "10px" }}
              >
                {order.shippingAddress ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state || ""}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="pt-3">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">No shipping address</p>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card
              className="border-gray-200 shadow-sm "
              style={{ padding: "10px", marginTop: "10px" }}
            >
              <CardHeader className="bg-gray-50 border-b px-6 ">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-700" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent
                className="p-6 text-sm space-y-2 text-gray-700"
                style={{ marginbottom: "0px" }}
              >
                {user ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {user.name || "—"}
                    </p>
                    <p className="break-all">{user.email || "—"}</p>
                    {user.phone && <p>Phone: {user.phone}</p>}
                  </>
                ) : (
                  <p className="italic text-gray-500">Guest checkout</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
{showInvoice && (
  <div className="fixed inset-0 z-50 bg-white overflow-auto">
    {/* Minimal top bar */}
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 print:hidden">
      <div className="max-w-7xl mx-auto flex justify-end gap-4">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded"
        >
          Save as PDF
        </button>
        <button
          onClick={() => setShowInvoice(false)}
          className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded"
        >
          Close
        </button>
      </div>
    </div>

    <div className="p-6 md:p-8 lg:p-12 print:p-8 print:max-w-[260mm] print:mx-auto">
      <div
        ref={invoiceRef}
        className="bg-white text-black max-w-7xl mx-auto print:max-w-[260mm] print:shadow-none"
      >
        {/* Header */}
        <div className="pb-12 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-2xl tracking-tight">INVOICE</h4>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                <p>
                  <span className="inline-block w-28">Number</span>
                  <span>INV-{order.id}-{new Date().getFullYear()}</span>
                </p>
                <p>
                  <span className="inline-block w-28">Date</span>
                  <span>{formatDate(order.createdAt)}</span>
                </p>
                <p>
                  <span className="inline-block w-28">Status</span>
                  <span>Paid</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl tracking-tight">Dexie Demo</div>
              <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                <p>123 Business Avenue, Suite 500</p>
                <p>Corporate Park, Mumbai 400001</p>
                <p>support@dexiedemo.com</p>
                <p>+91 22 4567 8900</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill to & Ship to */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 border-b border-gray-200">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Billed To</div>
            {user ? (
              <div className="text-base space-y-1.5">
                <div>{user.name || "Guest Customer"}</div>
                <div>{user.email || "—"}</div>
                {user.phone && <div>Phone: {user.phone}</div>}
              </div>
            ) : (
              <div className="text-sm text-gray-600">Anonymous Customer</div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Shipping To</div>
            {order.shippingAddress ? (
              <div className="text-base space-y-1.5">
                <div>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </div>
                <div>{order.shippingAddress.address}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state || ""}{" "}
                  {order.shippingAddress.postalCode}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Standard Shipping</div>
            )}
          </div>
        </div>

        {/* Items table – bolder items + more spacing */}
        <div className="py-16">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="pb-5 text-left font-normal w-5/12 lg:w-[55%]">Description</th>
                <th className="pb-5 text-right font-normal w-2/12">Rate</th>
                <th className="pb-5 text-center font-normal w-1/12">Qty</th>
                <th className="pb-5 text-right font-normal w-2/12">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-6 pr-8">
                    <div className="font-semibold text-gray-900">
                      {item.name || item.title || "Product Item"}
                    </div>
                    {item.variant && (
                      <div className="text-xs text-gray-500 mt-2">
                        Variant: {item.variant}
                      </div>
                    )}
                  </td>
                  <td className="py-6 text-right">
                    ₹{(item.price || 0).toFixed(2)}
                  </td>
                  <td className="py-6 text-center">{item.quantity || 1}</td>
                  <td className="py-6 text-right">
                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end py-10 border-t border-gray-300">
          <div className="w-full max-w-md lg:max-w-xl space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{(order.subtotal || order.total || 0).toFixed(2)}</span>
            </div>

            {order.shippingFee !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₹{order.shippingFee.toFixed(2)}</span>
              </div>
            )}

            {order.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between pt-5 border-t border-gray-400 text-base">
              <span>Total</span>
              <span className="font-normal">₹{order.total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-20 text-center text-xs text-gray-500">
          <p>Payment processed securely. Transaction ID: TXN-{order.id}</p>
          <p className="mt-6">
            This is a computer generated invoice and does not require a signature.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Dexie Demo Store</p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
