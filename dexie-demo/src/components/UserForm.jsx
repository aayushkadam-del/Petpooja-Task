import React, { useState, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import db from "../db/db";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Presentational input field moved outside main component to keep identity stable
const InputField = ({
  icon: Icon,
  name,
  type,
  placeholder,
  label,
  value,
  onChange,
  onBlur,
  touched,
  error,
  isValid,
}) => {
  const hasError = touched && error;

  const getInputStyle = () => {
    const baseStyle = {
      width: "100%",
      paddingLeft: "44px",
      paddingRight: "44px",
      paddingTop: "12px",
      paddingBottom: "12px",
      border: "2px solid",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    };

    if (hasError) {
      return {
        ...baseStyle,
        borderColor: "#f87171",
        backgroundColor: "#fef2f2",
      };
    }

    if (isValid) {
      return {
        ...baseStyle,
        borderColor: "#4ade80",
        backgroundColor: "#f0fdf4",
      };
    }

    return {
      ...baseStyle,
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
    };
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        {label} <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon size={20} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={getInputStyle()}
        />
        {isValid && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckCircle size={20} />
          </div>
        )}
        {hasError && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AlertCircle size={20} />
          </div>
        )}
      </div>
      {hasError && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "#dc2626",
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
          }}
        >
          <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
const SelectField = ({
  icon: Icon,
  name,
  label,
  value,
  onChange,
  onBlur,
  touched,
  error,
  options,
}) => {
  const hasError = touched && error;

  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        {label} <span style={{ color: "#ef4444" }}>*</span>
      </label>

      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        >
          <Icon size={20} />
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          style={{
            width: "100%",
            paddingLeft: "44px",
            paddingRight: "12px",
            paddingTop: "12px",
            paddingBottom: "12px",
            border: `2px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
            borderRadius: "8px",
            fontSize: "15px",
            backgroundColor: "#fff",
          }}
        >
          <option value="">Select country</option>
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {hasError && (
        <p style={{ fontSize: "13px", color: "#dc2626", marginTop: "8px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    password: "",
    country: "",
    isAdmin: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const patterns = {
    name: /^[a-zA-Z\s]{3,50}$/,
    email:/^(?!.*\.\.)(?!.*\.₹)[A-Za-z0-9!#₹%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#₹%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/,
    phone:/^[0-9]{10}$/,
    age: /^(?:[1-9]|[1-9][0-9]|1[01][0-9]|120)$/,
    password:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@₹!%*?&])[A-Za-z\d@₹!%*?&]{8,}$/,
    country: /^(UK|USA|India)$/,
  };

  const validateField = useCallback(
    (fieldName, value) => {
      setErrors((prev) => {
        const newErrors = { ...prev };

        switch (fieldName) {
          case "name":
            if (!value) newErrors.name = "Name is required";
            else if (!patterns.name.test(value))
              newErrors.name =
                "Name must be 3-50 characters and contain only letters";
            else delete newErrors.name;
            break;

          case "email":
            if (!value) newErrors.email = "Email is required";
            else if (!patterns.email.test(value))
              newErrors.email = "Please enter a valid email address";
            else delete newErrors.email;
            break;

          case "phone":
            if (!value) newErrors.phone = "Phone number is required";
            else if (!patterns.phone.test(value))
              newErrors.phone = "Phone number must be exactly 10 digits";
            else delete newErrors.phone;
            break;

          case "age":
            if (!value) newErrors.age = "Age is required";
            else if (!patterns.age.test(value))
              newErrors.age = "Age must be between 1 and 120";
            else delete newErrors.age;
            break;

          case "password":
            if (!value) newErrors.password = "Password is required";
            else if (!patterns.password.test(value))
              newErrors.password =
                "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
            else delete newErrors.password;
            break;
          case "country":
            if (!value) newErrors.country = "Country is required";
            else delete newErrors.country;
            break;

          default:
            break;
        }

        return newErrors;
      });

      // return whether field is valid (after setErrors completes this isn't immediate but caller only uses truthy behavior)
      return patterns[fieldName] ? patterns[fieldName].test(value) : true;
    },
    [patterns]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      validateField(name, value);
    },
    [validateField]
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = async () => {
    const allFieldsValid = Object.keys(patterns).every((field) => {
      return patterns[field].test(formData[field]);
    });

    if (!allFieldsValid) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        age: true,
        password: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const existingUser = await db.users
        .where("email")
        .equals(formData.email)
        .first();
      if (existingUser) {
        setErrors({
          form: "Email already registered. Please use a different email or login.",
        });
        setLoading(false);
        return;
      }

      await db.users.add({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        password: formData.password,
        country: formData.country,
        role: formData.isAdmin ? "admin" : "customer",
        createdAt: new Date(),
      });

      setSuccessMessage(
        "User registered successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        password: "",
        country: "",
        isAdmin: false,
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Dexie error:", error);
      setErrors({ form: "Failed to register. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isFieldValid = (field) => {
    return formData[field] && !errors[field];
  };

  const passwordChecks = [
    { label: "At least 8 characters", test: formData.password.length >= 8 },
    { label: "One uppercase letter", test: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", test: /[a-z]/.test(formData.password) },
    { label: "One number", test: /\d/.test(formData.password) },
    {
      label: "One special character (@₹!%*?&)",
      test: /[@₹!%*?&]/.test(formData.password),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "48px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "448px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#FF9900",
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            Welcome!
          </div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "8px",
              marginTop: "0",
            }}
          >
            Create Account
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: "0",
            }}
          >
            Sign up to start shopping
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            padding: "24px",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* Error Alert */}
          {errors.form && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <AlertCircle
                size={20}
                color="#721c24"
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "#721c24",
                  margin: 0,
                }}
              >
                {errors.form}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <CheckCircle
                size={20}
                color="#155724"
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "#155724",
                  margin: 0,
                  fontWeight: "600",
                }}
              >
                {successMessage}
              </p>
            </div>
          )}

          <InputField
            icon={User}
            name="name"
            type="text"
            placeholder="Enter your full name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.name}
            error={errors.name}
            isValid={isFieldValid("name")}
          />

          <InputField
            icon={Mail}
            name="email"
            type="email"
            placeholder="you@example.com"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            isValid={isFieldValid("email")}
          />

          <InputField
            icon={Phone}
            name="phone"
            type="tel"
            placeholder="1234567890"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.phone}
            error={errors.phone}
            isValid={isFieldValid("phone")}
          />
          <SelectField
            icon={User}
            name="country"
            label="Country"
            value={formData.country}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.country}
            error={errors.country}
            options={["UK", "USA", "India"]}
          />

          <InputField
            icon={Calendar}
            name="age"
            type="number"
            placeholder="Enter your age"
            label="Age"
            value={formData.age}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.age}
            error={errors.age}
            isValid={isFieldValid("age")}
          />

          <InputField
            icon={Lock}
            name="password"
            type="password"
            placeholder="Create a strong password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.password}
            error={errors.password}
            isValid={isFieldValid("password")}
          />

          {/* Password Requirements */}
          <div
            style={{
              backgroundColor: "#fafafa",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #e0e0e0",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#222",
                marginBottom: "8px",
                marginTop: "0",
              }}
            >
              Password must contain:
            </p>
            <ul
              style={{
                fontSize: "12px",
                color: "#666",
                margin: "0",
                padding: "0",
                listStyle: "none",
              }}
            >
              {passwordChecks.map((check, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom:
                      index < passwordChecks.length - 1 ? "4px" : "0",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: check.test ? "#FF9900" : "#ddd",
                    }}
                  ></div>
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Checkbox */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAdmin: e.target.checked,
                  }))
                }
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#FF9900",
                }}
              />
              <span>Register as Admin</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: loading ? "#ccc" : "#FF9900",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) =>
              !loading && (e.target.style.background = "#FF9900")
            }
            onMouseLeave={(e) =>
              !loading && (e.target.style.background = "#FF9900")
            }
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Footer */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0",
              }}
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                style={{
                  color: "#0066c0",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "0",
                  transition: "color 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#004B87")}
                onMouseLeave={(e) => (e.target.style.color = "#0066c0")}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#999",
            marginTop: "24px",
          }}
        >
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
};

export default UserForm;
