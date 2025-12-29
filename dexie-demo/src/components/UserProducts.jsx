import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, ArrowLeft, Plus, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import db from '../db/db';

const UserProducts = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUserProducts();
  }, [currentUser, navigate]);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      // Fetch only products belonging to the current user
      const userProducts = await db.products
        .where('userId')
        .equals(currentUser.id)
        .toArray();
      setProducts(userProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await db.products.delete(productId);
      fetchUserProducts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#667eea',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            padding: 0
          }}
          onMouseEnter={(e) => e.target.style.color = '#764ba2'}
          onMouseLeave={(e) => e.target.style.color = '#667eea'}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#111827',
          margin: 0,
          flex: 1,
          textAlign: 'center'
        }}>
          My Products
        </h2>

        <button
          onClick={() => navigate('/add-product')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          <Plus size={18} />
          Add Product
        </button>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px' }}>Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '2px dashed #e5e7eb'
          }}>
            <Package size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              No products yet
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Create your first product listing to get started
            </p>
            <button
              onClick={() => navigate('/add-product')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              <Plus size={18} />
              Create First Product
            </button>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '24px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              You have <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            </div>

            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {products.map(product => (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Product Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111827',
                      margin: 0,
                      flex: 1
                    }}>
                      {product.name}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#f3f4f6',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280'
                    }}>
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div style={{
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0',
                      lineHeight: '1.5'
                    }}>
                      {product.description}
                    </p>
                  </div>

                  {/* Price and Date */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: '0 0 4px 0'
                      }}>
                        Price
                      </p>
                      <p style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#667eea',
                        margin: 0
                      }}>
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: '0 0 4px 0'
                      }}>
                        Added
                      </p>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {formatDate(product.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#6b7280',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e5e7eb';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#dc2626',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fee2e2';
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              marginTop: 0,
              marginBottom: '12px'
            }}>
              Delete Product?
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProducts;
