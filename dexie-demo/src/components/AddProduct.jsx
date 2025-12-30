import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import db from "../db/db";
import { Card } from "./ui/card";

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
        else if (!/^\d+(\.\d{1,2})?₹/.test(value))
          error = "Enter valid price (e.g. 99.99)";
        else if (parseFloat(value) <= 0) error = "Price must be greater than 0";
        break;
      case "quantity":
        if (!value) error = "Quantity is required";
        else if (!/^\d+₹/.test(value)) error = "Must be a whole number";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show errors
    setTouched({
      name: true,
      price: true,
      quantity: true,
      description: true,
      image: true,
      country: true,
      discountPercentage: true, // ← added
    });

    // Validate all
    const fields = [
      "name",
      "price",
      "quantity",
      "description",
      "country",
      "discountPercentage",
    ]; // ← added
    const isValid = fields.every((field) => validate(field, formData[field]));

    if (!isValid) return;

    setLoading(true);

    try {
      await db.products.add({
        userId: currentUser.id,
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description.trim(),
        category: formData.category,
        country: formData.country,
        image: formData.image.trim() || null,
        discountPercentage: parseFloat(formData.discountPercentage) || 0, // ← added
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/manage-inventory"), 1800); // adjust route if needed
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Failed to add product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              maxWidth: "720px",
              margin: "40px auto",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid #d5d9d9",
                borderRadius: "8px",
                padding: "32px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h1
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  color: "#0F1111",
                }}
              >
                Add a new product
              </h1>
              <p
                style={{
                  margin: "0 0 32px 0",
                  color: "#565959",
                  fontSize: "14px",
                }}
              >
                Fill in the details below to list your product.
              </p>

              {success && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    padding: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <CheckCircle size={20} color="#15803d" />
                  <div>
                    <strong>Success!</strong> Product added. Redirecting...
                  </div>
                </div>
              )}

              {errors.submit && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    padding: "16px",
                    marginBottom: "24px",
                    color: "#991b1b",
                  }}
                >
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Product Name */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Product name <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ₹{
                        touched.name && errors.name ? "#c40000" : "#d5d9d9"
                      }`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      background:
                        touched.name && errors.name ? "#fff1f1" : "white",
                    }}
                  />
                  {touched.name && errors.name && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Price (in local currency){" "}
                    <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#565959",
                      }}
                    >
                      {formData.country === "India"
                        ? "₹"
                        : formData.country === "USA"
                        ? "₹"
                        : "£"}
                    </span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        width: "97%",
                        padding: "10px 12px 10px 32px",
                        border: `1px solid ₹{
                          touched.price && errors.price ? "#c40000" : "#d5d9d9"
                        }`,
                        borderRadius: "4px",
                        fontSize: "14px",
                        background:
                          touched.price && errors.price ? "#fff1f1" : "white",
                      }}
                    />
                  </div>
                  {touched.price && errors.price && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Quantity available{" "}
                    <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ₹{
                        touched.quantity && errors.quantity
                          ? "#c40000"
                          : "#d5d9d9"
                      }`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      background:
                        touched.quantity && errors.quantity
                          ? "#fff1f1"
                          : "white",
                    }}
                  />
                  {touched.quantity && errors.quantity && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.quantity}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Category <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d5d9d9",
                      borderRadius: "4px",
                      fontSize: "14px",
                      background: "white",
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
                </div>

                {/* Country - NEW DROPDOWN */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Country/Region <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ₹{
                        touched.country && errors.country
                          ? "#c40000"
                          : "#d5d9d9"
                      }`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      background:
                        touched.country && errors.country ? "#fff1f1" : "white",
                    }}
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                  {touched.country && errors.country && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Discount Percentage - NEW FIELD */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Discount Percentage{" "}
                    <span style={{ color: "#666" }}>(optional)</span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="number"
                      name="discountPercentage"
                      min="0"
                      max="90"
                      step="0.1"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      style={{
                        width: "120px",
                        padding: "10px 12px",
                        border: `1px solid ₹{
                          touched.discountPercentage &&
                          errors.discountPercentage
                            ? "#c40000"
                            : "#d5d9d9"
                        }`,
                        borderRadius: "4px",
                        fontSize: "14px",
                        background:
                          touched.discountPercentage &&
                          errors.discountPercentage
                            ? "#fff1f1"
                            : "white",
                      }}
                    />
                    <span style={{ fontSize: "16px", color: "#555" }}>%</span>
                  </div>
                  {touched.discountPercentage && errors.discountPercentage && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.discountPercentage}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#565959",
                      marginTop: "4px",
                    }}
                  >
                    Enter 0 for no discount. Maximum allowed is 90%.
                  </p>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Description <span style={{ color: "#c40000" }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ₹{
                        touched.description && errors.description
                          ? "#c40000"
                          : "#d5d9d9"
                      }`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      background:
                        touched.description && errors.description
                          ? "#fff1f1"
                          : "white",
                      resize: "vertical",
                    }}
                  />
                  {touched.description && errors.description && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div style={{ marginBottom: "32px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "#0F1111",
                    }}
                  >
                    Product image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://example.com/product.jpg"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ₹{
                        touched.image && errors.image ? "#c40000" : "#d5d9d9"
                      }`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      background:
                        touched.image && errors.image ? "#fff1f1" : "white",
                    }}
                  />
                  {touched.image && errors.image && (
                    <p
                      style={{
                        color: "#c40000",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.image}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#565959",
                      marginTop: "6px",
                    }}
                  >
                    Provide a direct link to a high-quality product image
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: loading ? "#cccccc" : "#FF9900",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "15px",
                    fontWeight: "500",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Adding Product..." : "Add Product"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </Card>
    </>
  );
};

export default AddProduct;
