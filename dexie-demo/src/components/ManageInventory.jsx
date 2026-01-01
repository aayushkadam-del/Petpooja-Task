import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  Search,
  AlertCircle,
  Edit2,
  LogOut,
  Home,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import db from "../db/db";
import { Card } from "@/components/ui/card";

export default function ManageInventory() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await db.products.toArray();
      setProducts(allProducts || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setErrorMessage("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      await db.products.update(productId, { quantity: newQuantity });
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, quantity: newQuantity } : p
        )
      );
      setSuccessMessage("Quantity updated");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setErrorMessage("Failed to update quantity");
    }
  };

  const handleStartEdit = (product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name || "",
      price: product.price || 0,
      quantity: product.quantity || 0,
      description: product.description || "",
      category: product.category || "Other",
      image: product.image || "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]:
        field === "price" || field === "quantity" ? Number(value) || 0 : value,
    }));
  };

  const handleSaveEdit = async (productId) => {
    try {
      await db.products.update(productId, editData);
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, ...editData } : p))
      );
      setEditingId(null);
      setEditData({});
      setSuccessMessage("Product updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage("Failed to update product");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`))
      return;
    try {
      await db.products.delete(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setSuccessMessage("Product deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting product:", error);
      setErrorMessage("Failed to delete product");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading inventory...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f7f7fb 0%, #ffffff 100%)",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(90deg,#0f172a,#0b1220)",
          color: "white",
          padding: "14px 20px",
          position: "sticky",
          top: 0,
          zIndex: 60,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Home size={26} style={{ color: "#FFA500" }} />
            <div>
              <div style={{ fontSize: "14px", color: "#ddd" }}>Admin Panel</div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                Inventory Management
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/add-product")}
              style={{
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "8px 14px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={16} /> Add Product
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                gap: 8,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "28px auto", padding: "0 20px" }}>
        {successMessage && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              padding: "14px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                background: "#155724",
                borderRadius: "50%",
              }}
            />
            <p
              style={{
                fontSize: "14px",
                color: "#155724",
                margin: 0,
                fontWeight: "500",
              }}
            >
              {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              padding: "14px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <AlertCircle
              size={18}
              color="#721c24"
              style={{ marginTop: "2px" }}
            />
            <p style={{ fontSize: "14px", color: "#721c24", margin: 0 }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Search + view toggle */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "94%",
                padding: "10px 14px 10px 40px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                padding: "10px 16px",
                background: "#f3f4f6",
                borderRadius: 8,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Total Products: {filteredProducts.length}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "8px 12px",
                  background: viewMode === "grid" ? "#FFA500" : "white",
                  color: viewMode === "grid" ? "black" : "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  padding: "8px 12px",
                  background: viewMode === "table" ? "#FFA500" : "white",
                  color: viewMode === "table" ? "white" : "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "white",
            }}
          >
            <AlertCircle
              size={40}
              style={{ color: "#d1d5db", margin: "0 auto 16px" }}
            />
            <p style={{ fontSize: "16px", color: "#666" }}>
              {searchTerm
                ? "No products found matching your search"
                : "No products yet. Add your first product!"}
            </p>
          </Card>
        ) : viewMode === "grid" ? (
          // Grid view remains unchanged (already has edit)
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 20,
            }}
          >
            {paginatedProducts.map((product) => (
              <Card
                key={product.id}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {product.image && (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                      background: "#f3f4f6",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
                <div style={{ padding: 16, flex: 1 }}>
                  {editingId === product.id ? (
                    <div>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          handleEditChange("name", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) =>
                          handleEditChange("price", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />
                      <input
                        type="number"
                        value={editData.quantity}
                        onChange={(e) =>
                          handleEditChange("quantity", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />
                      <select
                        value={editData.category}
                        onChange={(e) =>
                          handleEditChange("category", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      >
                        <option>Electronics</option>
                        <option>Clothing</option>
                        <option>Books</option>
                        <option>Home & Garden</option>
                        <option>Sports</option>
                        <option>Toys</option>
                        <option>Other</option>
                      </select>
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          minHeight: "80px",
                          marginBottom: "8px",
                        }}
                      />
                      <input
                        type="url"
                        value={editData.image}
                        onChange={(e) =>
                          handleEditChange("image", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          marginBottom: "12px",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleSaveEdit(product.id)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ... normal grid view content remains the same ...
                    <>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#222",
                        }}
                      >
                        {product.name}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            background: "#f3f4f6",
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {product.category}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#059669",
                          }}
                        >
                          ₹{product.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          margin: "0 0 12px 0",
                          maxHeight: "60px",
                          overflow: "hidden",
                        }}
                      >
                        {product.description}
                      </p>
                      <div
                        style={{
                          backgroundColor: "#f9fafb",
                          padding: 12,
                          borderRadius: 6,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: 8,
                            fontWeight: 600,
                          }}
                        >
                          Available Stock: {product.quantity || 0}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                product.quantity - 1
                              )
                            }
                            style={{
                              flex: 1,
                              padding: "6px",
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              borderRadius: 4,
                            }}
                          >
                            -
                          </button>
                          <div
                            style={{
                              flex: 1,
                              padding: "6px",
                              background: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: 4,
                              textAlign: "center",
                            }}
                          >
                            {product.quantity || 0}
                          </div>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                product.quantity + 1
                              )
                            }
                            style={{
                              flex: 1,
                              padding: "6px",
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              borderRadius: 4,
                            }}
                          >
                            +
                          </button>
                        </div>
                        {product.quantity === 0 && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#dc2626",
                              marginTop: 8,
                            }}
                          >
                            ⚠ Out of Stock
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleStartEdit(product)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background:
                              "linear-gradient(135deg, #FF9900 0%, #FF8800 100%)",
                            color: "#111",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background:
                              "linear-gradient(135deg, #232F3E 0%, #1a242f 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              background: "white",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #e6e9ee",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    Quantity
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      borderBottom: "2px solid #eef2f7",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "10px" }}>{product.id}</td>

                    {editingId === product.id ? (
                      <>
                        <td style={{ padding: "10px" }}>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              handleEditChange("name", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              fontSize: "14px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "10px" }}>
                          <select
                            value={editData.category}
                            onChange={(e) =>
                              handleEditChange("category", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              fontSize: "14px",
                            }}
                          >
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Books</option>
                            <option>Home & Garden</option>
                            <option>Sports</option>
                            <option>Toys</option>
                            <option>Other</option>
                          </select>
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) =>
                              handleEditChange("price", e.target.value)
                            }
                            style={{
                              width: "90px",
                              padding: "6px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              textAlign: "right",
                            }}
                          />
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) =>
                              handleEditChange("quantity", e.target.value)
                            }
                            style={{
                              width: "80px",
                              padding: "6px 8px",
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              textAlign: "right",
                            }}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "10px" }}>
                          <strong>{product.name}</strong>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#666",
                              marginTop: 4,
                            }}
                          >
                            {product.description?.slice(0, 80) || ""}
                          </div>
                        </td>
                        <td style={{ padding: "10px" }}>{product.category}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          ₹{product.price?.toFixed(2) || "0.00"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {product.quantity || 0}
                        </td>
                      </>
                    )}

                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {editingId === product.id ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => handleSaveEdit(product.id)}
                            style={{
                              padding: "6px 12px",
                              background: "#22c55e",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              fontSize: "13px",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: "6px 12px",
                              background: "#6b7280",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              fontSize: "13px",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => handleStartEdit(product)}
                            style={{
                              padding: "6px 12px",
                              background: "#f0f2f2",
                              color: "#0f1111",
                              border: "1px solid #d5d9d9",
                              borderRadius: 4,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                (product.quantity || 0) + 1
                              )
                            }
                            style={{
                              padding: "6px 12px",
                              background: "#ffd814",
                              color: "#0f1111",
                              border: "1px solid #fcd200",
                              borderRadius: 4,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            +1
                          </button>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product.id,
                                (product.quantity || 0) - 1
                              )
                            }
                            style={{
                              padding: "6px 12px",
                              background: "#f0f2f2",
                              color: "#0f1111",
                              border: "1px solid #d5d9d9",
                              borderRadius: 4,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            -1
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            style={{
                              padding: "6px 12px",
                              background: "white",
                              color: "#b12704",
                              border: "1px solid #b12704",
                              borderRadius: 4,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > ITEMS_PER_PAGE && (
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 16px",
                background: "white",
                border: "1px solid #d5d9d9",
                borderRadius: "8px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                color: "#0f1111",
                fontSize: "14px",
                fontWeight: 500,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show only a few page numbers around the current page if there are many pages
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 2
                ) {
                  if (Math.abs(pageNum - currentPage) === 3) {
                    return (
                      <span key={pageNum} style={{ color: "#565959" }}>
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: currentPage === pageNum ? "#FFA500" : "white",
                      color: currentPage === pageNum ? "black" : "#0f1111",
                      border: "1px solid",
                      borderColor:
                        currentPage === pageNum ? "#FFA500" : "#d5d9d9",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: currentPage === pageNum ? 700 : 500,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 16px",
                background: "white",
                border: "1px solid #d5d9d9",
                borderRadius: "8px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                color: "#0f1111",
                fontSize: "14px",
                fontWeight: 500,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}