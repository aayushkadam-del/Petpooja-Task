import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import db from "../db/db";

export default function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

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

  //   const getStatusBadgeStyle = (status) => {
  //     const styles = {
  //       pending:    { bg: '#fef3e8', color: '#c45500', border: '#ff9900' },
  //       confirmed:  { bg: '#e3f4e9', color: '#007600' },
  //       processing: { bg: '#e3f4e9', color: '#007600' },
  //       shipped:    { bg: '#e3f4e9', color: '#007600' },
  //       delivered:  { bg: '#e3f4e9', color: '#007600' },
  //       cancelled:  { bg: '#fdeaeb', color: '#c40000' },
  //     };
  //     const s = status?.toLowerCase() || 'pending';
  //     return styles[s] || { bg: '#f0f0f0', color: '#444', border: '#ccc' };
  //   };

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

  return (
    <div
      style={{
        background: "#f3f3f3",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header – Amazon style */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 500,
              color: "#111",
            }}
          >
            Manage Orders
          </h1>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "8px 16px",
                border: "1px solid #d5d9d9",
                borderRadius: "3px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <button
              onClick={loadOrders}
              style={{
                padding: "8px 16px",
                border: "1px solid #d5d9d9",
                borderRadius: "3px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Quick filters (Amazon-like status summary) */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(
            (s) => {
              const count = orders.filter(
                (o) => (o.status || "pending").toLowerCase() === s.toLowerCase()
              ).length;
              return (
                <div
                  key={s}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: count > 0 ? "#fff" : "#f0f0f0",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    fontWeight: count > 0 ? 500 : 400,
                    color: count > 0 ? "#111" : "#666",
                  }}
                >
                  {s} ({count})
                </div>
              );
            }
          )}
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "32px",
              textAlign: "center",
              borderRadius: "8px",
              border: "1px solid #ddd",
              color: "#555",
            }}
          >
            No orders found.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {orders.map((order) => {
              //   const statusStyle = getStatusBadgeStyle(order.status);

              return (
                <div
                  key={order.id}
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#555",
                          marginBottom: "4px",
                        }}
                      >
                        Order <strong>#{order.id}</strong> •{" "}
                        {formatDate(order.createdAt)}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "#0066c0",
                        }}
                      >
                        {order._user?.name || "Guest"} •{" "}
                        {order._user?.email || "—"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "10px",
                        minWidth: "240px",
                      }}
                    >
                      {/* Status */}
                      <div>
                        <label
                          style={{
                            fontSize: "12px",
                            color: "#555",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Order Status
                        </label>
                        <select
                          value={order.status || "pending"}
                          onChange={(e) =>
                            updateOrder(order.id, { status: e.target.value })
                          }
                          style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: "1px solid #d5d9d9",
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

                      {/* Payment */}
                      <div>
                        <label
                          style={{
                            fontSize: "12px",
                            color: "#555",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Payment
                        </label>
                        <select
                          value={order.paymentStatus || "paid"}
                          onChange={(e) =>
                            updateOrder(order.id, {
                              paymentStatus: e.target.value,
                            })
                          }
                          style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: "1px solid #d5d9d9",
                            minWidth: "160px",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      {/* Quick actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          onClick={() => navigate(`/orders/₹{order.id}`)} // ← assume you have detail page
                          style={{
                            padding: "6px 14px",
                            border: "1px solid #0066c0",
                            color: "#0066c0",
                            background: "transparent",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          View Order
                        </button>
                        <button
                          onClick={() =>
                            updateOrder(order.id, { status: "shipped" })
                          }
                          disabled={
                            order.status === "shipped" ||
                            order.status === "delivered"
                          }
                          style={{
                            padding: "6px 14px",
                            background:
                              order.status === "shipped" ? "#ccc" : "#ffa41c",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Mark as Shipped
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Two-column content */}
                  <div
                    style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}
                  >
                    {/* Shipping */}
                    <div style={{ flex: "1", minWidth: "260px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          marginBottom: "8px",
                          color: "#111",
                        }}
                      >
                        Shipping Address
                      </div>
                      {order.shippingAddress ? (
                        <div
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.5",
                            color: "#444",
                          }}
                        >
                          <div>
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                          </div>
                          <div>{order.shippingAddress.address}</div>
                          <div>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.postalCode}
                          </div>
                          <div>Phone: {order.shippingAddress.phone || "—"}</div>
                        </div>
                      ) : (
                        <div style={{ color: "#777" }}>No address</div>
                      )}
                    </div>

                    {/* Items + Summary */}
                    <div style={{ flex: "1.4", minWidth: "300px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          marginBottom: "8px",
                          color: "#111",
                        }}
                      >
                        Items ({order.items?.length || 0})
                      </div>
                      <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                        {order.items?.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ color: "#0066c0" }}>
                              {it.name || it.title || "Item"}
                            </span>
                            <span>₹{(it.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        Total:{" "}
                        <span style={{ color: "#b12704" }}>
                          ₹{order.total?.toFixed(2) || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge (Amazon style pill) */}
                  {/* <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ₹{statusStyle.border || statusStyle.color}`,
                  }}>
                    {(order.status || 'PENDING').toUpperCase()}
                  </div> */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
