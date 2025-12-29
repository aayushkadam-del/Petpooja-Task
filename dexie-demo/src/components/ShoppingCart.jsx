import { useEffect, useState } from 'react';
import { Trash2, ShoppingCart as ShoppingCartIcon, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import db from '../db/db';

export default function ShoppingCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
    const items = await db.cart.where('userId').equals(currentUser.id).toArray();

const groupedItems = items.reduce((acc, item) => {
  if (!acc[item.productId]) {
    acc[item.productId] = {
      ...item,
      quantity: 1,
      cartIds: [item.id]
    };
  } else {
    acc[item.productId].quantity += 1;
    acc[item.productId].cartIds.push(item.id);
  }
  return acc;
}, {});

setCartItems(Object.values(groupedItems));

      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await db.cart.delete(cartItemId);
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

const calculateTotal = () => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};


  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ color: '#333', fontSize: '18px' }}>Loading cart...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', margin: 0, padding: 0 }}>
      {/* Amazon-style Header */}
      <header style={{
        background: '#131921',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '1500px', margin: '0 auto' }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#FFB81C',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            <Home size={24} /> Shop
          </div>
          <div style={{ flex: 1 }}></div>
          <button
            onClick={handleContinueShopping}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Continue Shopping
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Page Title */}
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: '#333' }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <ShoppingCartIcon size={80} style={{ color: '#ddd', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
              Your Amazon Cart is empty
            </h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Add items to your cart to get started. Check out our deals!
            </p>
            <button
              onClick={handleContinueShopping}
              style={{
                padding: '12px 40px',
                background: '#FF9900',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E87E04'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FF9900'}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
            {/* Cart Items Section */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
                Items in your cart ({cartItems.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '15px',
                      paddingBottom: '15px',
                      borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    {/* Product Image */}
                    <div style={{
                      fontSize: '60px',
                      minWidth: '100px',
                      textAlign: 'center',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                        <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#0066c0', cursor: 'pointer' }}>
                        {item.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '13px' }}>
                        <span style={{ color: '#666' }}>In Stock</span>
                        <span style={{ color: '#666' }}>Free Shipping</span>
                      </div>
                      <p style={{ color: '#B12704', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>
                        ${item.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#0066c0',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#c7254e'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#0066c0'}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
  Quantity: <strong>{item.quantity}</strong>
</div>

                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: '80px'
              }}>
                {/* Subtotal Box */}
                <div style={{
                  padding: '12px 0',
                  marginBottom: '12px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Shipping:</span>
                    <span style={{ color: '#4caf50', fontWeight: '700' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Estimated Tax:</span>
                    <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                {/* Total Box */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '15px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Total:</span>
                  <span style={{ color: '#B12704' }}>${(calculateTotal() * 1.1).toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#FF9900',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginBottom: '10px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E87E04'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FF9900'}
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping Link */}
                <button
                  onClick={handleContinueShopping}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#f0f0f0',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                >
                  Continue Shopping
                </button>
              </div>

              {/* Promo Code */}
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '15px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  Have a promo code?
                </label>
                <input
                  type="text"
                  placeholder="Enter code"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
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
