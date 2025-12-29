import React, { useState } from 'react';
import { Package, DollarSign, FileText, AlertCircle, CheckCircle, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import db from '../db/db';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

const AddProduct = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Electronics'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const patterns = {
    name: /^[a-zA-Z0-9\s\-]{3,100}$/,
    price: /^\d+(\.\d{1,2})?$/,
    description: /^[a-zA-Z0-9\s\-.,!?]{10,500}$/,
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value) {
          newErrors.name = 'Product name is required';
        } else if (!patterns.name.test(value)) {
          newErrors.name = 'Product name must be 3-100 characters (letters, numbers, spaces, hyphens)';
        } else {
          delete newErrors.name;
        }
        break;

      case 'price':
        if (!value) {
          newErrors.price = 'Price is required';
        } else if (!patterns.price.test(value)) {
          newErrors.price = 'Please enter a valid price (e.g., 99.99)';
        } else if (parseFloat(value) <= 0) {
          newErrors.price = 'Price must be greater than 0';
        } else {
          delete newErrors.price;
        }
        break;

      case 'description':
        if (!value) {
          newErrors.description = 'Description is required';
        } else if (value.length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else if (value.length > 500) {
          newErrors.description = 'Description must not exceed 500 characters';
        } else {
          delete newErrors.description;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const allFieldsValid = Object.keys(patterns).every(field => {
      return patterns[field].test(formData[field]);
    });

    if (!allFieldsValid) {
      setTouched({
        name: true,
        price: true,
        description: true
      });
      setLoading(false);
      return;
    }

    try {
      // Add product to database with user reference
      await db.products.add({
        userId: currentUser.id,
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSuccess(true);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'Electronics'
      });
      setTouched({});
      setErrors({});

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors({ form: 'Failed to add product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isFieldValid = (field) => {
    return formData[field] && !errors[field];
  };

  const InputField = ({ name, type, icon: Icon, placeholder, label, value, isTextarea = false }) => {
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && isFieldValid(name);

    const getInputStyle = () => {
      const baseStyle = {
        width: '100%',
        paddingLeft: Icon ? '40px' : '12px',
        paddingRight: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        border: '1px solid',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
      };

      if (hasError) {
        return { ...baseStyle, borderColor: '#f87171', backgroundColor: '#fef2f2' };
      }
      if (isValid) {
        return { ...baseStyle, borderColor: '#4ade80', backgroundColor: '#f0fdf4' };
      }
      return { ...baseStyle, borderColor: '#ccc', backgroundColor: '#ffffff' };
    };

    return (
      <div style={{ marginBottom: '18px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '700',
          color: '#222',
          marginBottom: '6px'
        }}>
          {label} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          {!isTextarea && Icon && (
            <Icon size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
          )}
          {isTextarea ? (
            <textarea
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              rows="4"
              style={{
                ...getInputStyle(),
                paddingLeft: '12px',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              style={getInputStyle()}
            />
          )}
          {isValid && (
            <CheckCircle size={16} style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#22c55e'
            }} />
          )}
          {hasError && (
            <AlertCircle size={16} style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ef4444'
            }} />
          )}
        </div>
        {hasError && (
          <p style={{
            marginTop: '6px',
            fontSize: '12px',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '4px',
            margin: '6px 0 0 0'
          }}>
            <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{errors[name]}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar style={{ background: '#131921', color: 'white', width: '280px', borderRight: '1px solid #333' }}>
        <SidebarHeader style={{ padding: '20px', borderBottom: '1px solid #333' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            <Home size={20} style={{ color: '#FF9900' }} />
            <span>Seller Portal</span>
          </div>
        </SidebarHeader>

        <SidebarContent style={{ padding: '20px 0' }}>
          <SidebarGroup>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#333';
                  e.target.style.borderColor = '#FF9900';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#444';
                }}
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>

              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#333';
                  e.target.style.borderColor = '#FF9900';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#444';
                }}
              >
                <Package size={16} />
                My Products
              </button>

              <div style={{ height: '1px', background: '#333', margin: '12px 0' }}></div>

              <div style={{ color: '#999', fontSize: '12px', padding: '0 16px' }}>
                <p style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: 'bold' }}>Account</p>
                <p style={{ margin: '6px 0', color: '#ccc' }}>User: {currentUser?.name}</p>
                <p style={{ margin: '6px 0', color: '#ccc' }}>Email: {currentUser?.email}</p>
              </div>
            </div>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter style={{ padding: '20px', borderTop: '1px solid #333' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#FF9900',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#E87E04'}
            onMouseLeave={(e) => e.target.style.background = '#FF9900'}
          >
            <LogOut size={16} />
            Logout
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Form Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                background: '#FFF3E0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <Package size={28} color="#FF9900" />
              </div>
              <h2 style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#222',
                margin: '0 0 8px 0'
              }}>
                Add New Product
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0
              }}>
                List a new product in your store
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <CheckCircle size={18} color="#155724" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{
                  fontSize: '14px',
                  color: '#155724',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Product added successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Error Alert */}
            {errors.form && (
              <div style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertCircle size={18} color="#721c24" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{
                  fontSize: '14px',
                  color: '#721c24',
                  margin: 0
                }}>
                  {errors.form}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <InputField
                name="name"
                type="text"
                icon={Package}
                placeholder="e.g., iPhone 15 Pro"
                label="Product Name"
                value={formData.name}
              />

              <InputField
                name="price"
                type="number"
                icon={DollarSign}
                placeholder="e.g., 999.99"
                label="Price"
                value={formData.price}
              />

              {/* Category */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#222',
                  marginBottom: '6px'
                }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF9900'}
                  onBlur={(e) => e.target.style.borderColor = '#ccc'}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Toys">Toys</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <InputField
                name="description"
                type="text"
                placeholder="Describe your product in detail..."
                label="Description"
                value={formData.description}
                isTextarea={true}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#ccc' : '#FF9900',
                  color: '#ffffff',
                  fontWeight: '600',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '20px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#E87E04')}
                onMouseLeave={(e) => !loading && (e.target.style.background = '#FF9900')}
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
