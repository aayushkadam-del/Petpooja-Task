import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Search,
} from "lucide-react";
import db from "../db/db";
import { Card } from "./ui/card";

const PRODUCT_TEMPLATES = [
  {
    id: "tp1",
    name: "Apple iPhone 15 Pro",
    price: "129900",
    description:
      "Latest Apple iPhone with Titanium design, A17 Pro chip, and advanced camera system.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/81Sig6biNGL._AC_SL1500_.jpg",
    discountPercentage: "5",
  },
  {
    id: "tp2",
    name: "Samsung Galaxy S24 Ultra",
    price: "109999",
    description:
      "Premium Android smartphone with Galaxy AI, 200MP camera, and S Pen.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/71RVuS3q9QL._AC_SL1500_.jpg",
    discountPercentage: "10",
  },
  {
    id: "tp3",
    name: "MacBook Air M2",
    price: "99900",
    description:
      "Supercharged by M2, 13.6-inch Liquid Retina Display, 8GB RAM, 256GB SSD.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SL1500_.jpg",
    discountPercentage: "12",
  },
  {
    id: "tp4",
    name: "Sony WH-1000XM5",
    price: "29900",
    description:
      "Industry leading noise canceling headphones with Auto NC Optimizer.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/51aBtkSTh7L._AC_SL1000_.jpg",
    discountPercentage: "15",
  },
  {
    id: "tp5",
    name: "Nike Air Jordan 1",
    price: "14995",
    description:
      "Iconic basketball shoes with premium leather and classic silhouette.",
    category: "Clothing",
    image: "https://m.media-amazon.com/images/I/6125yAfsJKL._AC_UX679_.jpg",
    discountPercentage: "0",
  },
  {
    id: "tp6",
    name: "Logitech MX Master 3S",
    price: "10995",
    description:
      "Performance wireless mouse with ultrafast scrolling and 8K DPI tracking.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg",
    discountPercentage: "8",
  },
  {
    id: "tp7",
    name: "Dell XPS 15",
    price: "154990",
    description:
      "Powerful laptop with 15.6-inch OLED display, i9 processor, and NVIDIA RTX graphics.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/81-nE8tPj0L._AC_SL1500_.jpg",
    discountPercentage: "5",
  },
  {
    id: "tp8",
    name: "Bose QuietComfort Ultra",
    price: "35900",
    description:
      "Immersive audio headphones with world-class noise cancellation and spatial audio.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/51XvC3mEOfL._AC_SL1500_.jpg",
    discountPercentage: "10",
  },
  {
    id: "tp9",
    name: "Apple Watch Series 9",
    price: "41900",
    description:
      "Smarter, brighter, and more powerful with advanced health and fitness tracking.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/71YdbLh2p1L._AC_SL1500_.jpg",
    discountPercentage: "7",
  },
  {
    id: "tp10",
    name: "Kindle Paperwhite (16 GB)",
    price: "14999",
    description:
      "6.8-inch display, adjustable warm light, and up to 10 weeks of battery life.",
    category: "Books",
    image: "https://m.media-amazon.com/images/I/51fIe6YyvXL._AC_SL1000_.jpg",
    discountPercentage: "15",
  },
  {
    id: "tp11",
    name: "iPad Pro 12.9-inch (M2)",
    price: "112900",
    description:
      "Brilliant Liquid Retina XDR display, M2 chip, and Apple Pencil Hover support.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/81c+9BOQNWL._AC_SL1500_.jpg",
    discountPercentage: "5",
  },
  {
    id: "tp12",
    name: "Canon EOS R5",
    price: "329995",
    description:
      "Professional full-frame mirrorless camera with 45MP sensor and 8K video.",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/81F-7mJ6VWL._AC_SL1500_.jpg",
    discountPercentage: "0",
  },
  {
    id: "tp13",
    name: "Instant Pot Duo 7-in-1",
    price: "9990",
    description:
      "Electric pressure cooker, slow cooker, rice cooker, and more in one appliance.",
    category: "Home & Garden",
    image: "https://m.media-amazon.com/images/I/61S8n6xKFIL._AC_SL1500_.jpg",
    discountPercentage: "20",
  },
  {
    id: "tp14",
    name: "Nintendo Switch OLED",
    price: "32900",
    description:
      "Handheld gaming console with 7-inch OLED screen and enhanced audio.",
    category: "Toys",
    image: "https://m.media-amazon.com/images/I/61m9R6V-U0L._AC_SL1500_.jpg",
    discountPercentage: "5",
  },
  {
    id: "tp15",
    name: "Levi's 501 Original Fit Jeans",
    price: "3499",
    description:
      "Classic straight-leg jeans with button fly and timeless style.",
    category: "Clothing",
    image: "https://m.media-amazon.com/images/I/81+m0Q6Bv8L._AC_UX679_.jpg",
    discountPercentage: "30",
  },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Electronics",
    country: "India", // default to India
    quantity: "",
    image: "",
    discountPercentage: "0", // ← added: default to 0%
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [pendingProducts, setPendingProducts] = useState([]);

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#0F1111",
    fontSize: "14px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d5d9d9",
    borderRadius: "4px",
    fontSize: "14px",
    background: "white",
    boxSizing: "border-box",
  };

  const errorStyle = {
    color: "#c40000",
    fontSize: "13px",
    marginTop: "4px",
  };

  const currencySymbolStyle = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#565959",
    fontSize: "14px",
  };

  const filteredTemplates = PRODUCT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const handleTemplateSelect = (template) => {
    console.log(template, "selected template ");
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      price: template.price,
      description: template.description,
      category: template.category,
      image: template.image,
      discountPercentage: template.discountPercentage,
    }));
    // Clear errors for auto-filled fields
    setErrors({});
    setTouched({});
  };

  // Redirect if not logged in or not admin
  if (!currentUser?.id || currentUser.role !== "admin") {
    navigate(currentUser?.id ? "/dashboard" : "/login");
    return null;
  }

  const validate = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Product name is required";
        else if (value.length < 3 || value.length > 100)
          error = "Name must be 3–100 characters";
        break;
      case "price":
        if (!value) error = "Price is required";
        else if (!/^\d+(\.\d{1,2})?$/.test(value))
          error = "Enter valid price (e.g. 99.99)";
        else if (parseFloat(value) <= 0) error = "Price must be greater than 0";
        break;
      case "quantity":
        if (!value) error = "Quantity is required";
        else if (!/^\d+$/.test(value)) error = "Must be a whole number";
        else if (parseInt(value) < 0) error = "Quantity cannot be negative";
        break;
      case "description":
        if (!value.trim()) error = "Description is required";
        else if (value.length < 10)
          error = "Description too short (min 10 characters)";
        else if (value.length > 1000)
          error = "Description too long (max 1000 characters)";
        break;
      case "country":
        if (!value) error = "Please select a country";
        break;
      case "discountPercentage": // ← added validation
        const disc = value === "" ? 0 : parseFloat(value);
        if (isNaN(disc) || disc < 0 || disc > 90) {
          error = "Discount must be between 0 and 90%";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(name, formData[name]);
  };

  const addToQueue = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    const fields = ["name", "price", "quantity", "description", "country", "discountPercentage"];
    fields.forEach(f => allTouched[f] = true);
    setTouched(allTouched);

    const isValid = fields.every((field) => validate(field, formData[field]));
    if (!isValid) return;

    const newProduct = {
      ...formData,
      id: Date.now(), // temporary ID for the list
      userId: currentUser.id,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      discountPercentage: parseFloat(formData.discountPercentage) || 0,
    };

    setPendingProducts(prev => [...prev, newProduct]);
    
    // Reset form for next product
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "Electronics",
      country: "India",
      quantity: "",
      image: "",
      discountPercentage: "0",
    });
    setTouched({});
    setErrors({});
  };

  const removeFromQueue = (id) => {
    setPendingProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleFinalSubmit = async () => {
    if (pendingProducts.length === 0) return;
    setLoading(true);

    try {
      const productsToSave = pendingProducts.map(p => ({
        userId: p.userId,
        name: p.name.trim(),
        price: p.price,
        quantity: p.quantity,
        description: p.description.trim(),
        category: p.category,
        country: p.country,
        image: p.image.trim() || null,
        discountPercentage: p.discountPercentage,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Bulk add to Dexie
      await db.products.bulkAdd(productsToSave);

      setSuccess(true);
      setPendingProducts([]);
      setTimeout(() => navigate("/manage-inventory"), 1800);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to add products. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          input:focus, select:focus, textarea:focus {
            outline: none !important;
            border-color: #e77600 !important;
            box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5) !important;
          }
        `}
      </style>
      <Card>
        <div
          style={{
            minHeight: "100vh",
            background: "#f5f5f5",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {/* Top navigation bar - Amazon style */}
          <header
            style={{
              background: "#131921",
              color: "white",
              padding: "12px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              width: "100%",
              zIndex: 100,
            }}
          >
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#FF9900" }}
            >
              Seller Portal
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  background: "transparent",
                  border: "1px solid #546172",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={16} /> Dashboard
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem("currentUser");
                  navigate("/");
                }}
                style={{
                  background: "#e47911",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Sign out
              </button>
            </div>
          </header>

          {/* Main content */}
          <main
            style={{
              display: "flex",
              height: "calc(100vh - 56px)", // Full height minus header
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Left Side: Catalog Selection */}
            <div
              style={{
                width: "25%",
                borderRight: "1px solid #d5d9d9",
                display: "flex",
                flexDirection: "column",
                background: "#f7f7f7",
              }}
            >
              <div style={{ padding: "16px", borderBottom: "1px solid #d5d9d9", background: "white" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={18} color="#FF9900" />
                  Catalog
                </h3>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#565959" }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "30px", paddingBottom: "8px", paddingTop: "8px" }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      background: "white",
                      border: "1px solid #d5d9d9",
                      borderRadius: "6px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center"
                    }}
                  >
                    <img src={template.image} alt="" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#0F1111", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{template.name}</div>
                      <div style={{ fontSize: "11px", color: "#B12704", fontWeight: "bold" }}>₹{parseFloat(template.price).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Side: Product Form */}
            <div
              style={{
                width: "45%",
                overflowY: "auto",
                padding: "30px",
                background: "white",
                borderRight: "1px solid #d5d9d9",
              }}
            >
              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#0F1111" }}>Product Details</h2>
                <p style={{ margin: "0 0 24px 0", color: "#565959", fontSize: "13px" }}>Enter info or select from catalog.</p>

                <form onSubmit={addToQueue} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Product name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} style={{ ...inputStyle, borderColor: touched.name && errors.name ? "#c40000" : "#d5d9d9" }} />
                      {touched.name && errors.name && <p style={errorStyle}>{errors.name}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>Price *</label>
                      <div style={{ position: "relative" }}>
                        <span style={currencySymbolStyle}>{formData.country === "India" ? "₹" : "$"}</span>
                        <input type="text" name="price" value={formData.price} onChange={handleChange} onBlur={handleBlur} style={{ ...inputStyle, paddingLeft: "28px", borderColor: touched.price && errors.price ? "#c40000" : "#d5d9d9" }} />
                      </div>
                      {touched.price && errors.price && <p style={errorStyle}>{errors.price}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>Quantity *</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} onBlur={handleBlur} style={{ ...inputStyle, borderColor: touched.quantity && errors.quantity ? "#c40000" : "#d5d9d9" }} />
                      {touched.quantity && errors.quantity && <p style={errorStyle}>{errors.quantity}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                        <option>Electronics</option><option>Clothing</option><option>Books</option><option>Home & Garden</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Discount %</label>
                      <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} style={inputStyle} />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Description *</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} rows={3} style={{ ...inputStyle, resize: "none" }} />
                      {touched.description && errors.description && <p style={errorStyle}>{errors.description}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: "20px",
                      width: "100%",
                      padding: "12px",
                      background: "#f0c14b",
                      border: "1px solid #a88734",
                      borderRadius: "4px",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Add to Queue
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side: Review & Save */}
            <div
              style={{
                width: "30%",
                background: "#f3f3f3",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
              }}
            >
              <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Queue ({pendingProducts.length})
                {pendingProducts.length > 0 && (
                  <span style={{ fontSize: "12px", color: "#0066c0", cursor: "pointer" }} onClick={() => setPendingProducts([])}>Clear all</span>
                )}
              </h2>

              <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
                {pendingProducts.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#565959", marginTop: "40px" }}>
                    Your queue is empty.<br/>Add products from the left.
                  </div>
                ) : (
                  pendingProducts.map((p) => (
                    <div key={p.id} style={{ background: "white", padding: "12px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #d5d9d9", position: "relative" }}>
                      <button 
                        onClick={() => removeFromQueue(p.id)}
                        style={{ position: "absolute", right: "8px", top: "8px", border: "none", background: "none", color: "#565959", cursor: "pointer", fontSize: "16px" }}
                      >
                        ×
                      </button>
                      <div style={{ fontWeight: "600", fontSize: "13px", paddingRight: "20px" }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: "#565959", marginTop: "4px" }}>
                        Qty: {p.quantity} | ₹{p.price}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {success && (
                 <div style={{ color: "#067D62", fontSize: "14px", marginBottom: "10px", textAlign: "center", fontWeight: "bold" }}>
                   Successfully saved to inventory!
                 </div>
              )}

              <button
                disabled={pendingProducts.length === 0 || loading}
                onClick={handleFinalSubmit}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: pendingProducts.length === 0 ? "#ddd" : "#FF9900",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: pendingProducts.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {loading ? "Saving..." : `Add ${pendingProducts.length} Products to Inventory`}
              </button>
            </div>
          </main>
        </div>
      </Card>
    </>
  );
};

export default AddProduct;
