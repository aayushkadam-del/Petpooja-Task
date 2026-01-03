import { useEffect, useState } from "react";
import { Trash2, ShoppingCart as ShoppingCartIcon, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import db from "../db/db";

export default function ShoppingCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  useEffect(() => {
    loadCart();
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const count = await db.cart
        .where("userId")
        .equals(currentUser.id)
        .count();
      setCartCount(count);
    } catch (err) {
      console.error("Error loading cart count:", err);
    }
  };

  const loadCart = async () => {
    try {
      const cartEntries = await db.cart
        .where("userId")
        .equals(currentUser.id)
        .toArray();

      if (cartEntries.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const productIds = [...new Set(cartEntries.map((e) => e.productId))];

      const products = await db.products
        .where("id")
        .anyOf(productIds)
        .toArray();
      const productMap = {};
      products.forEach((p) => {
        productMap[p.id] = p;
      });

      const grouped = cartEntries.reduce((acc, entry) => {
        const pid = entry.productId;
        if (!acc[pid]) {
          const prod = productMap[pid] || {};
          acc[pid] = {
            ...entry, 
            productId: pid,
            quantity: 0,
            cartIds: [],
            discountPercentage: prod.discountPercentage || 0,
            originalPrice: prod.price || entry.price,
          };
        }
        
        acc[pid].quantity += 1;
        acc[pid].cartIds.push(entry.id);
        return acc;
      }, {});

      setCartItems(Object.values(grouped));
      setLoading(false);
    } catch (error) {
      console.error("Error loading cart:", error);
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await db.cart.where({ userId: currentUser.id, productId }).delete();
      setCartItems((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      loadCartCount();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const priceAfterDiscount =
        item.originalPrice * (1 - item.discountPercentage / 100);
      return sum + priceAfterDiscount * item.quantity;
    }, 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((sum, item) => {
      if (item.discountPercentage === 0) return sum;
      const discountPerUnit =
        item.originalPrice * (item.discountPercentage / 100);
      return sum + discountPerUnit * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = () => navigate("/checkout");
  const handleContinueShopping = () => navigate("/marketplace");

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        <p style={{ color: "#333", fontSize: "18px" }}>Loading cart...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        margin: 0,
        padding: 0,
      }}
    >
      <header
        style={{
          background: "#131921",
          padding: "10px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            maxWidth: "1500px",
            margin: "0 auto",
          }}
        >
          <div
            onClick={() => navigate("/dashboard")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#FFB81C",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            <Home size={24} /> Shop
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                color: "#FF9900",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                position: "relative",
              }}
            >
              {/* <div style={{ position: "relative" }}>
                <ShoppingCartIcon size={24} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#f08804",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div> */}
            </div>
            <button
              onClick={handleContinueShopping}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "4px",
                fontSize: "13px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          // ... empty cart unchanged ...
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "60px 20px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ShoppingCartIcon
              size={80}
              style={{ color: "#ddd", margin: "0 auto 20px" }}
            />
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#333",
              }}
            >
              Your Cart is empty
            </h2>
            <p
              style={{ color: "#666", marginBottom: "30px", fontSize: "16px" }}
            >
              Add items to get started.
            </p>
            <button
              onClick={handleContinueShopping}
              style={{
                padding: "12px 40px",
                background: "#FF9900",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E87E04")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FF9900")
              }
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: "15px",
                }}
              >
                Items ({cartItems.length})
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {cartItems.map((item, index) => {
                  const discountedPrice =
                    item.originalPrice * (1 - item.discountPercentage / 100);
                  const showDiscount = item.discountPercentage > 0;

                  return (
                    <div
                      key={item.productId} // better key
                      style={{
                        display: "flex",
                        gap: "15px",
                        paddingBottom: "15px",
                        borderBottom:
                          index < cartItems.length - 1
                            ? "1px solid #eee"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "100px",
                          height: "100px",
                          background: "#f5f5f5",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/100?text=No+Image"
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/100?text=No+Image";
                          }}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#0066c0",
                          }}
                        >
                          {item.name}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "10px",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#B12704",
                            }}
                          >
                            ₹{discountedPrice.toFixed(2)}
                          </span>

                          {showDiscount && (
                            <>
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#555",
                                  textDecoration: "line-through",
                                }}
                              >
                                ₹{item.originalPrice.toFixed(2)}
                              </span>
                              <span
                                style={{
                                  color: "#c7511f",
                                  fontWeight: "600",
                                  fontSize: "13px",
                                }}
                              >
                                -{item.discountPercentage}%
                              </span>
                            </>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: "13px",
                            color: showDiscount ? "#007600" : "#555",
                            marginBottom: "8px",
                          }}
                        >
                          {showDiscount ? "Discount applied" : "No discount"}
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#c40000",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>

                      <div style={{ fontSize: "14px", color: "#111" }}>
                        Qty: <strong>{item.quantity}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  position: "sticky",
                  top: "80px",
                }}
              >
                <div
                  style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        fontSize: "14px",
                        color: "#c7511f",
                      }}
                    >
                      <span>Savings</span>
                      <span>-₹{savings.toFixed(2)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span>Shipping</span>
                    <span style={{ color: "#007600", fontWeight: "600" }}>
                      FREE
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                    }}
                  >
                    <span>Estimated Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: "700",
                    margin: "16px 0",
                    color: "#111",
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: "#B12704" }}>₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#FF9900",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    marginBottom: "12px",
                  }}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={handleContinueShopping}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#f5f5f5",
                    color: "#111",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Continue Shopping
                </button>
              </div>

              {/* Promo code (unchanged) */}
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "15px",
                  marginTop: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <label
                  style={{
                    fontWeight: "700",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Have a promo code?
                </label>
                <input
                  type="text"
                  placeholder="Enter code"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
