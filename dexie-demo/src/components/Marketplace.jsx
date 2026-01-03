import { useState, useEffect } from "react";
import { ShoppingCart, Search, Home, LogOut, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import db from "../db/db";
import { STATIC_PRODUCTS } from "../data/products";
export default function Marketplace() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const [products, setProducts] = useState([]);
  // console.log(products,"products")
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState(currentUser?.country || "All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }
    loadProducts();
    loadCartCount();
    
  }, []);

  const loadCartCount = async () => {
    try {
      const count = await db?.cart?.where("userId").equals(currentUser.id).count();
      setCartCount(count);
    } catch (err) {
      console.error("Error loading cart count:", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const dbProducts = await db.products.toArray();
      const allProducts = dbProducts.length > 0 ? dbProducts : STATIC_PRODUCTS;
      setProducts(allProducts);
    } catch (err) {
      console.error(err);
      setProducts(STATIC_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };
  const categories = [
    "All",
    ...new Set(products.map((p) => p.category || "Uncategorized")),
  ];

  const countries = currentUser?.role === "admin" 
    ? ["All", ...new Set(products.map((p) => p.country || "India"))]
    : [currentUser?.country || "India"];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    
    // Enforce country filter for non-admins
    const userCountry = currentUser?.country || "India";
    const isAdmin = currentUser?.role === "admin";
    
    const matchesCountry = isAdmin 
      ? (selectedCountry === "All" || (p.country || "India") === selectedCountry)
      : (p.country || "India") === userCountry;

    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const inStock = (p.quantity ?? 1) > 0;
    return matchesCategory && matchesCountry && matchesSearch && inStock;
  });
  console.log(selectedCountry,"selectedCountry")

  // console.log(filteredProducts,"filteredProducts")
  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const available = selectedProduct.quantity ?? 999;
    if (quantity > available) {
      setMessage(`Only ${available} left in stock!`);
      setTimeout(() => setMessage(""), 2200);
      
      return;
    }

    try {
      // Add multiple items if quantity > 1
      for (let i = 0; i < quantity; i++) {
        await db.cart.add({
          userId: currentUser.id,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          image: selectedProduct.image,
          addedAt: new Date(),
        });
      }

      // Decrease stock
      if (selectedProduct.quantity !== undefined) {
        await db.products.update(selectedProduct.id, {
          quantity: Math.max(0, selectedProduct.quantity - quantity),
        });
        loadProducts(); // refresh stock
        loadCartCount(); // refresh cart count
      } else {
        loadCartCount();
      }

      setMessage(`Added ${quantity} to your cart`);
      setTimeout(() => {
        setMessage("");
        setSelectedProduct(null);
        setQuantity(1);
      }, 1800);
    } catch (err) {
      console.error(err);
      setMessage("Could not add to cart");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };
// console.log(productquantity,"productquantity")
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Header – Amazon style */}
      <header
        style={{
          background: "#131921",
          color: "white",
          padding: "10px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1500px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <div
            onClick={() => navigate("/dashboard")}
            style={{
              cursor: "pointer",
              color: "#ff9900",
              fontSize: "22px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Home size={24} /> Marketplace
          </div>

          {/* Search */}
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
            }}
          >
            <Search size={18} style={{ color: "#666", marginRight: "8px" }} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                color:'black',
                flex: 1,
                fontSize: "15px",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button
              onClick={() => navigate("/cart")}
              style={{
                background: "transparent",
                border: "none",
                color: "#ff9900",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <ShoppingCart size={22} />
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
              </div>
              Cart
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                color: "#ddd",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex" }}>
        {/* Sidebar – Categories */}
        <aside
          style={{
            width: "240px",
            background: "white",
            padding: "20px 0",
            borderRight: "1px solid #ddd",
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            position: "sticky",
            top: "64px",
          }}
        >
          <div
            style={{
              padding: "0 20px",
              marginBottom: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#0F1111",
            }}
          >
            Departments
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                width: "100%",
                padding: "10px 20px",
                textAlign: "left",
                background:
                  selectedCategory === cat ? "#f0f8ff" : "transparent",
                border: "none",
                borderLeft:
                  selectedCategory === cat ? "4px solid #ff9900" : "none",
                color: selectedCategory === cat ? "#146eb4" : "#0F1111",
                fontWeight: selectedCategory === cat ? "600" : "400",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}

          <div
            style={{
              padding: "20px 20px 16px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#0F1111",
              borderTop: "1px solid #eee",
              marginTop: "10px"
            }}
          >
            Countries
          </div>
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              style={{
                width: "100%",
                padding: "10px 20px",
                textAlign: "left",
                background:
                  selectedCountry === c ? "#f0f8ff" : "transparent",
                border: "none",
                borderLeft:
                  selectedCountry === c ? "4px solid #ff9900" : "none",
                color: selectedCountry === c ? "#146eb4" : "#0F1111",
                fontWeight: selectedCountry === c ? "600" : "400",
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "24px" }}>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "80px 0", color: "#555" }}
            >
              Loading products...
            </div>
          ) : (
            <>
              <div
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                {filteredProducts.length} results
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedCountry !== "All" && ` from ${selectedCountry}`}
                {searchQuery && ` for "${searchQuery}"`}
              </div>

              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#777",
                  }}
                >
                  No products match your filters.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.12)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          height: "220px",
                          background: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "12px",
                        }}
                      >
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/200?text=No+Image"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/200?text=No+Image";
                          }}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div style={{ padding: "12px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#0F1111",
                            marginBottom: "6px",
                            height: "40px",
                            overflow: "hidden",
                          }}
                        >
                          {product.name}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                           <span style={{ fontSize: "12px", color: "#565959", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
                             {product.country || "India"}
                           </span>
                           <span style={{ fontSize: "12px", color: "#007185" }}>{product.category}</span>
                        </div>
                        <div
                          style={{
                            color: "#B12704",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginBottom: "6px",
                          }}
                        >
                          ₹{product.price.toFixed(2)}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: product.quantity > 0 ? "#007600" : "#c40000",
                            marginBottom: "8px",
                          }}
                        >
                          {product.quantity > 0
                            ? `${product.quantity} in stock`
                            : "Out of stock"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Detail Modal – Amazon-like */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "16px",
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "row",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left – Image */}
            <div
              style={{
                flex: "1 1 45%",
                padding: "32px",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={selectedProduct.image || "https://via.placeholder.com/400"}
                alt={selectedProduct.name}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/400?text=No+Image";
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Right – Info */}
            <div
              style={{
                flex: "1 1 55%",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  alignSelf: "flex-end",
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                ×
              </button>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "500",
                  margin: "0",
                  color: "#0F1111",
                }}
              >
                {selectedProduct.name}
              </h2>

              <div
                style={{
                  color: "#007185",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Visit store → {/* fake link */}
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#B12704",
                }}
              >
                ₹{selectedProduct.price.toFixed(2)}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: selectedProduct?.quantity > 0 ? "#007600" : "#c40000",
                }}
              >
                {selectedProduct.quantity > 0
                  ? `${selectedProduct.quantity} available`
                  : "Currently unavailable"}
              </div>

              <p style={{ color: "#0F1111", lineHeight: "1.5" }}>
                {selectedProduct.description}
              </p>

              {selectedProduct.quantity > 0 && (
                <div>
                  <label
                    style={{
                      fontWeight: "500",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid #d5d9d9",
                    }}
                  >
                    {[...Array(Math.min(10, selectedProduct.quantity))].map(
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {message && (
                <div
                  style={{
                    padding: "12px",
                    background: message.includes("Added")
                      ? "#f0fdf4"
                      : "#fef2f2",
                    color: message.includes("Added") ? "#166534" : "#991b1b",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  {message}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={selectedProduct.quantity <= 0}
                style={{
                  background:
                    selectedProduct.quantity > 0 ? "#FFD814" : "#cccccc",
                  color: selectedProduct.quantity > 0 ? "#0F1111" : "#666",
                  border: "1px solid #cdcdcd",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "15px",
                  cursor:
                    selectedProduct.quantity > 0 ? "pointer" : "not-allowed",
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
