// src/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
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
} from "lucide-react";
import db from "../db/db";

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
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Order #{order.id}
              </h3>
              <p className="text-sm text-gray-300 mt-0.5">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & date */}
            <Card className="border-gray-200 shadow-sm" style={{ padding: "10px", marginTop: "10px", marginLeft: "10px" }}>
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
              style={{ padding: "10px" , marginTop: "10px" ,marginLeft: "10px"}}

            >
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  Order Items ({order.items?.length || 0})
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
              style={{ padding: "10px" ,marginTop:'10px'}}
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
              <CardContent className="p-6 text-sm space-y-2 text-gray-700" style={{ marginbottom: "0px" }}>
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
    </div>
  );
}
