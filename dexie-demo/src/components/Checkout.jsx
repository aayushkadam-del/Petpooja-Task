import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, Lock, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import db from "../db/db";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]); // grouped with discount info
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  // console.log(formData,"formdata-->")
  const [errors, setErrors] = useState({});
  // console.log(errors,"errorrs-->")
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const editingOrder = JSON.parse(sessionStorage.getItem("editingOrder") || "null");

  useEffect(() => {
    loadCart();
    loadCartCount();
    if (editingOrder) {
      setIsEditing(true);
      if (editingOrder.shippingAddress) {
        setFormData((prev) => ({
          ...prev,
          ...editingOrder.shippingAddress,
        }));
      }
    }
  }, []);

  const loadCartCount = async () => {
    try {
      const count = await db.cart.where("userId").equals(currentUser.id).count();
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
            discountPercentage: prod.discountPercentage || 0,
            originalPrice: prod.price || entry.price,
          };
        }
        acc[pid].quantity += 1;
        return acc;
      }, {});

      setCartItems(Object.values(grouped));
      setLoading(false);
    } catch (error) {
      console.error("Error loading cart for checkout:", error);
      setLoading(false);
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!formData.firstName.match(/^[a-zA-Z\s]{2,50}$/)) {
      newErrors.firstName = "First name must be 2-50 characters";
    }
    if (!formData.lastName.match(/^[a-zA-Z\s]{2,50}$/)) {
      newErrors.lastName = "Last name must be 2-50 characters";
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.match(/^[a-zA-Z\s]{2,50}$/)) {
      newErrors.city = "Invalid city name";
    }
    if (!formData.postalCode.match(/^\d{5,10}$/)) {
      newErrors.postalCode = "Postal code must be 5-10 digits";
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    if (currentUser.role === "admin" && editingOrder) {
      return true;
    }
    const newErrors = {};
    if (!formData.cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = "Format: MM/YY";
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateShipping()) {
      setStep(2);
    }
  };

  const submitOrder = async () => {
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.originalPrice,
        discountPercentage: item.discountPercentage,
        quantity: item.quantity,
      }));

      const subtotal = calculateSubtotal();
      const total = subtotal * 1.1;

      const orderData = {
        userId: currentUser.id,
        items: orderItems,
        subtotal: subtotal,
        total: total,
        savings: calculateSavings(),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        status: editingOrder ? editingOrder.status : "confirmed",
        createdAt: editingOrder ? editingOrder.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (editingOrder) {
        await db.orders.update(editingOrder.id, orderData);
        sessionStorage.removeItem("editingOrder");
      } else {
        await db.orders.add(orderData);
      }

      // Clear cart - delete all entries for this user
      await db.cart.where("userId").equals(currentUser.id).delete();

      setOrderPlaced(true);
      setTimeout(() => {
        navigate(currentUser.role === "admin" ? "/manage-orders" : "/orders");
      }, 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      setErrors({ submit: "Error placing order. Please try again." });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }
    await submitOrder();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
        <p style={{ color: "#333", fontSize: "18px" }}>Loading...</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "60px 40px",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CheckCircle
            size={80}
            style={{ color: "#4caf50", margin: "0 auto 20px" }}
          />
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "15px",
              color: "#333",
            }}
          >
            {isEditing ? "Order Updated!" : "Order Confirmed!"}
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "20px",
              lineHeight: "1.6",
            }}
          >
            {isEditing
              ? "Your order has been successfully edited and changed."
              : "Thank you for your purchase. Your order has been successfully placed and will be shipped soon."}
          </p>
          <p style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}>
            Redirecting to your orders...
          </p>
        </div>
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
          padding: "12px 20px",
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
          <div onClick={() => navigate("/cart")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFB81C', fontSize: '14px', position: 'relative', marginRight: '10px' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingCartIcon size={22} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f08804', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>
          <span style={{ color: "#fff", fontSize: "13px" }}>
            {currentUser.role === "admin" && editingOrder ? "Editing Order" : "Secure checkout"}
          </span>
          <Lock size={18} style={{ color: "#FFB81C" }} />
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: step >= 1 ? "#FF9900" : "#ddd",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                1
              </div>
              <span
                style={{
                  fontWeight: "600",
                  color: step >= 1 ? "#333" : "#999",
                }}
              >
                {currentUser.role === "admin" && editingOrder ? "Order Details" : "Shipping"}
              </span>
            </div>
            {!(currentUser.role === "admin" && editingOrder) && (
              <>
                <div
                  style={{
                    width: "40px",
                    height: "2px",
                    background: step >= 2 ? "#FF9900" : "#ddd",
                  }}
                ></div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: step >= 2 ? "#FF9900" : "#ddd",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                  >
                    2
                  </div>
                  <span
                    style={{
                      fontWeight: "600",
                      color: step >= 2 ? "#333" : "#999",
                    }}
                  >
                    Payment
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "30px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            {step === 1 ? (
              <>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "25px",
                    color: "#333",
                  }}
                >
                  {currentUser.role === "admin" && editingOrder
                    ? "Edit order details"
                    : "Enter your address"}
                </h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${errors.firstName ? '#f44336' : '#ddd'}`,
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.firstName && (
                        <span
                          style={{
                            color: "#f44336",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.firstName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${errors.lastName ? '#f44336' : '#ddd'}`,
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.lastName && (
                        <span
                          style={{
                            color: "#f44336",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: `1px solid ${errors.email ? '#f44336' : '#ddd'}`,
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    {errors.email && (
                      <span
                        style={{
                          color: "#f44336",
                          fontSize: "12px",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: `1px solid ${errors.address ? '#f44336' : '#ddd'}`,
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    {errors.address && (
                      <span
                        style={{
                          color: "#f44336",
                          fontSize: "12px",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {errors.address}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${errors.city ? '#f44336' : '#ddd'}`,
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.city && (
                        <span
                          style={{
                            color: "#f44336",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.city}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: "600",
                          color: "#333",
                          fontSize: "14px",
                        }}
                      >
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${errors.postalCode ? '#f44336' : '#ddd'}`,
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.postalCode && (
                        <span
                          style={{
                            color: "#f44336",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.postalCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "30px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: `1px solid ${errors.phone ? '#f44336' : '#ddd'}`,
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    {errors.phone && (
                      <span
                        style={{
                          color: "#f44336",
                          fontSize: "12px",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
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
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#E87E04")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#FF9900")
                    }
                  >
                    {currentUser.role === "admin" && editingOrder
                      ? "Continue to Save"
                      : "Continue to Payment"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "25px",
                    color: "#333",
                  }}
                >
                  {currentUser.role === "admin" && editingOrder
                    ? "Review and Save"
                    : "Enter your payment details"}
                </h2>

                <form onSubmit={handlePlaceOrder}>
                  {!(currentUser.role === "admin" && editingOrder) && (
                    <>
                      <div style={{ marginBottom: "20px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#333",
                            fontSize: "14px",
                          }}
                        >
                          Credit Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="16"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: `1px solid ${errors.cardNumber ? '#f44336' : '#ddd'}`,
                            borderRadius: "4px",
                            fontSize: "14px",
                            boxSizing: "border-box",
                            fontFamily: "monospace",
                            letterSpacing: "2px",
                          }}
                        />
                        {errors.cardNumber && (
                          <span
                            style={{
                              color: "#f44336",
                              fontSize: "12px",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {errors.cardNumber}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "15px",
                          marginBottom: "30px",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            Expiry Date (MM/YY) *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="12/25"
                            maxLength="5"
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              border: `1px solid ${errors.expiryDate ? '#f44336' : '#ddd'}`,
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box",
                              fontFamily: "inherit",
                            }}
                          />
                          {errors.expiryDate && (
                            <span
                              style={{
                                color: "#f44336",
                                fontSize: "12px",
                                marginTop: "4px",
                                display: "block",
                              }}
                            >
                              {errors.expiryDate}
                            </span>
                          )}
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength="4"
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              border: `1px solid ${errors.cvv ? '#f44336' : '#ddd'}`,
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box",
                              fontFamily: "inherit",
                            }}
                          />
                          {errors.cvv && (
                            <span
                              style={{
                                color: "#f44336",
                                fontSize: "12px",
                                marginTop: "4px",
                                display: "block",
                              }}
                            >
                              {errors.cvv}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {currentUser.role === "admin" && editingOrder && (
                    <div style={{ marginBottom: "30px", padding: "15px", background: "#f8f9fa", borderRadius: "4px", border: "1px solid #e9ecef" }}>
                      <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                        Review the updated order items and shipping details. Click the button below to save your changes.
                      </p>
                    </div>
                  )}

                  {errors.submit && (
                    <div
                      style={{
                        padding: "12px",
                        background: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "4px",
                        marginBottom: "20px",
                        fontSize: "14px",
                      }}
                    >
                      {errors.submit}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#f0f0f0",
                        color: "#333",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#e0e0e0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#f0f0f0")
                      }
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#FF9900",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#E87E04")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#FF9900")
                      }
                    >
                      {editingOrder ? "Save Order" : "Place Order"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div>
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "15px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                position: "sticky",
                top: "80px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "15px",
                  color: "#333",
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {cartItems.map((item) => {
                  const discountedPrice =
                    item.originalPrice * (1 - item.discountPercentage / 100);
                  const showDiscount = item.discountPercentage > 0;

                  return (
                    <div key={item.productId} style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ color: "#444" }}>
                          {item.name} × {item.quantity}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#B12704" }}>
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                          {showDiscount && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#777",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      {showDiscount && (
                        <div style={{ fontSize: "12px", color: "#c7511f" }}>
                          -{item.discountPercentage}% discount
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: "15px", fontSize: "13px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      color: "#c7511f",
                    }}
                  >
                    <span>Savings:</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  <span>Shipping:</span>
                  <span style={{ color: "#4caf50", fontWeight: "700" }}>
                    FREE
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#666",
                  }}
                >
                  <span>Estimated Tax:</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div
                style={{
                  paddingTop: "12px",
                  borderTop: "2px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                <span>Total:</span>
                <span style={{ color: "#B12704" }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
