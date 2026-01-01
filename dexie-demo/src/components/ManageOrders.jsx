import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, RefreshCw, ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import db from "../db/db";

export default function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const pageSize = 10;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (currentUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    loadOrders();
  }, []);

  const handleEditOrder = async (order) => {
    try {
      // Clear existing cart for the current user
      await db.cart.where("userId").equals(currentUser.id).delete();

      // Add order items back to the cart
      for (const item of order.items) {
        // If the item has a productId, we use it. Otherwise, we might have an issue.
        // Assuming items in order have productId.
        for (let i = 0; i < (item.quantity || 1); i++) {
          await db.cart.add({
            userId: currentUser.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            addedAt: new Date(),
          });
        }
      }

      // Save order info for checkout
      sessionStorage.setItem("editingOrder", JSON.stringify(order));
      navigate("/marketplace");
    } catch (err) {
      console.error("Failed to prepare order for editing", err);
      alert("Failed to start editing. Please try again.");
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const all = await db.orders.orderBy("createdAt").reverse().toArray();
      const withUser = await Promise.all(
        all.map(async (o) => {
          const user = o.userId ? await db.users.get(o.userId) : null;
          return { ...o, _user: user };
        })
      );
      setOrders(withUser);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading orders", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, patch) => {
    try {
      await db.orders.update(id, patch);
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#555",
          fontSize: "18px",
        }}
      >
        Loading orders...
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderPagination = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        marginTop: "24px",
      }}
    >
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={{
          padding: "8px 16px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          background: "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          style={{
            padding: "8px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: currentPage === i + 1 ? "#f59e0b" : "#fff",
            color: currentPage === i + 1 ? "#fff" : "#111",
            fontWeight: currentPage === i + 1 ? 600 : 400,
            cursor: "pointer",
          }}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px 16px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          background: "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  );

  return (
    <div
      style={{
        background: "#f3f3f3",
        minHeight: "100vh",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            paddingBottom: "20px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 600, color: "#111" }}>
            Manage Orders
          </h1>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <button
              onClick={loadOrders}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={18} /> Refresh
            </button>

            <button
              onClick={() => setViewMode("cards")}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: viewMode === "cards" ? "#f59e0b" : "#fff",
                color: viewMode === "cards" ? "#fff" : "#111",
                fontWeight: viewMode === "cards" ? 600 : 400,
                cursor: "pointer",
              }}
            >
              Card View
            </button>

            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: viewMode === "table" ? "#f59e0b" : "#fff",
                color: viewMode === "table" ? "#fff" : "#111",
                fontWeight: viewMode === "table" ? 600 : 400,
                cursor: "pointer",
              }}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => {
            const count = orders.filter(
              (o) => (o.status || "pending").toLowerCase() === s.toLowerCase()
            ).length;
            return (
              <div
                key={s}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  background: count > 0 ? "#fff" : "#f3f4f6",
                  border: "1px solid #d1d5db",
                  fontSize: "0.95rem",
                  fontWeight: count > 0 ? 600 : 400,
                  color: count > 0 ? "#111" : "#6b7280",
                }}
              >
                {s} ({count})
              </div>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "12px",
              border: "1px solid #ddd",
              color: "#6b7280",
              fontSize: "1.1rem",
            }}
          >
            No orders found.
          </div>
        ) : viewMode === "table" ? (
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #ddd",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>ID</th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Customer</th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Status</th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Payment</th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Total</th>
                    <th style={{ padding: "16px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px" }}>#{order.id}</td>
                      <td style={{ padding: "16px" }}>{formatDate(order.createdAt)}</td>
                      <td style={{ padding: "16px" }}>
                        <div>{order._user?.name || "Guest"}</div>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {order._user?.email || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={order.paymentStatus || "paid"}
                          onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px", fontWeight: 600 }}>
                        ₹{order.total?.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          style={{
                            padding: "8px 12px",
                            marginRight: "8px",
                            border: "1px solid #3b82f6",
                            color: "#3b82f6",
                            background: "transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          style={{
                            padding: "8px 12px",
                            marginRight: "8px",
                            border: "1px solid #8b5cf6",
                            color: "#8b5cf6",
                            background: "transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => updateOrder(order.id, { status: "shipped" })}
                          disabled={order.status === "shipped" || order.status === "delivered"}
                          style={{
                            padding: "8px 16px",
                            background: order.status === "shipped" || order.status === "delivered" ? "#d1d5db" : "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: order.status === "shipped" || order.status === "delivered" ? "not-allowed" : "pointer",
                            opacity: order.status === "shipped" || order.status === "delivered" ? 0.6 : 1,
                          }}
                        >
                          Mark Shipped
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && renderPagination()}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "4px" }}>
                      Order <strong>#{order.id}</strong> • {formatDate(order.createdAt)}
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
                      {order._user?.name || "Guest"} • {order._user?.email || "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", minWidth: "240px" }}>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                        Status
                      </label>
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          minWidth: "160px",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                        Payment
                      </label>
                      <select
                        value={order.paymentStatus || "paid"}
                        onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                          minWidth: "160px",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        style={{
                          padding: "10px 20px",
                          border: "1px solid #3b82f6",
                          color: "#3b82f6",
                          background: "transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        View Order
                      </button>

                      <button
                        onClick={() => handleEditOrder(order)}
                        style={{
                          padding: "10px 20px",
                          border: "1px solid #8b5cf6",
                          color: "#8b5cf6",
                          background: "transparent",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Edit size={16} /> Edit
                      </button>

                      <button
                        onClick={() => updateOrder(order.id, { status: "shipped" })}
                        disabled={order.status === "shipped" || order.status === "delivered"}
                        style={{
                          padding: "10px 20px",
                          background: order.status === "shipped" || order.status === "delivered" ? "#d1d5db" : "#f59e0b",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: order.status === "shipped" || order.status === "delivered" ? "not-allowed" : "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Mark as Shipped
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
                      Shipping Address
                    </div>
                    {order.shippingAddress ? (
                      <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#374151" }}>
                        <div>
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </div>
                        <div>{order.shippingAddress.address}</div>
                        <div>
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </div>
                        <div style={{ marginTop: "8px" }}>
                          Phone: {order.shippingAddress.phone || "—"}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "#9ca3af" }}>No shipping address provided</div>
                    )}
                  </div>

                  <div style={{ flex: 1.6, minWidth: "320px" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
                      Items ({order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0})
                    </div>

                    {order.items?.length > 0 ? (
                      <div style={{ marginBottom: "16px" }}>
                        {order.items.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "12px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <span style={{ color: "#2563eb", fontWeight: 500 }}>
                              {it.name || it.title || "Unnamed item"} {it.quantity > 1 ? `x ${it.quantity}` : ""}
                            </span>
                            <span style={{ fontWeight: 600 }}>₹{(it.price * (it.quantity || 1)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "#9ca3af", marginBottom: "16px" }}>No items in this order</div>
                    )}

                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#b91c1c" }}>
                      Total: ₹{order.total?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}