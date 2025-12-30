import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Home } from 'lucide-react';
import db from '../db/db';
import { Button } from './ui/button';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const userOrders = await db.orders.where('userId').equals(currentUser.id).reverse().toArray();
      setOrders(userOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ color: '#666', fontSize: '18px' }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: '#131921',
        color: 'white',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Home size={24} style={{ color: '#FF9900', cursor: 'pointer' }} onClick={() => navigate('/dashboard')} />
            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>My Orders</h1>
          </div>
          <Button
            onClick={() => navigate('/marketplace')}
            style={{
              padding: '8px 16px',
              background: '#FF9900',
              color: 'white',
              border: 'none',
             
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FF9900'}
            onMouseLeave={(e) => e.target.style.background = '#FF9900'}
          >
            Continue Shopping
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ width: '100%', padding: '32px 20px' }}>
        {orders.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Package size={80} style={{ color: '#ccc', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#222' }}>
              No orders yet
            </h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
              You haven't placed any orders yet. Start shopping to create your first order and track it here.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              style={{
                padding: '12px 32px',
                background: '#FF9900',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#FF9900'}
              onMouseLeave={(e) => e.target.style.background = '#FF9900'}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>Order History</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Order Header - Always Visible */}
                  <div
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f9f9f9',
                      borderBottom: selectedOrder?.id === order.id ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#222' }}>
                        Order #{order.id}
                      </h3>
                      <p style={{ color: '#666', fontSize: '13px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#B12704', marginBottom: '8px' }}>
                        ₹{order.total.toFixed(2)}
                      </div>
                      <span style={{
                        padding: '6px 12px',
                        background: '#E8F5E9',
                        color: '#2E7D32',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        ✓ {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Details - Expandable */}
                  {selectedOrder?.id === order.id && (
                    <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e0e0e0' }}>
                      {/* Items */}
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '16px', color: '#222', fontSize: '15px' }}>Order Items</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e0e0e0' }}>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                <span style={{ fontSize: '32px', lineHeight: '1' }}>{item.image}</span>
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '4px' }}>{item.name}</p>
                                  <p style={{ fontSize: '13px', color: '#666' }}>Qty: {item.quantity || 1}</p>
                                </div>
                              </div>
                              <span style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>₹{item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#222', fontSize: '15px' }}>Delivery Address</h4>
                        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
                          <p style={{ fontWeight: '600', marginBottom: '8px' }}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p style={{ marginTop: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '8px' }}>
                            📧 {order.shippingAddress.email}
                          </p>
                          <p>📱 {order.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Back to Shopping Button */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button
                onClick={() => navigate('/marketplace')}
                style={{
                  padding: '12px 32px',
                  background: '#FF9900',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '15px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#FF9900'}
                onMouseLeave={(e) => e.target.style.background = '#FF9900'}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
