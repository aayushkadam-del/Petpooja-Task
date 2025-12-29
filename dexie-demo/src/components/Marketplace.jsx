import { useState } from 'react';
import { ShoppingCart, Search, Home, LogOut } from 'lucide-react';
import { STATIC_PRODUCTS } from '../data/products';
import { useNavigate } from 'react-router-dom';
import db from '../db/db';
import { Button } from './ui/button';
export default function Marketplace() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  // Get unique categories
  const categories = ['All', ...new Set(STATIC_PRODUCTS.map(p => p.category))];
const userCountry = currentUser?.country;

  // Filter products
const filteredProducts = STATIC_PRODUCTS.filter(product => {
  const matchesCategory =
    selectedCategory === 'All' || product.category === selectedCategory;

  const matchesSearch =
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesCountry =
    !userCountry || product.availableCountries?.includes(userCountry);

  return matchesCategory && matchesSearch && matchesCountry;
});
    

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      // Add item to cart table
      for (let i = 0; i < quantity; i++) {
        await db.cart.add({
          userId: currentUser.id,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          image: selectedProduct.image,
          addedAt: new Date()
        });
      }
      setMessage(`✓ Added ${quantity} item(s) to cart!`);
      setTimeout(() => {
        setMessage('');
        setSelectedProduct(null);
        setQuantity(1);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Error adding to cart');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  return (<>

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
              fontWeight: 'bold',
              minWidth: '150px'
            }}
          >
            <Home size={24} /> Shop
          </div>

          {/* Search Bar */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '4px',
            padding: '8px 12px'
          }}>
            <Search size={20} style={{ color: '#666', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Cart & Logout */}
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFB81C',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 184, 28, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ShoppingCart size={24} /> Cart
          </button>

          <button
            onClick={handleLogout}
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
            <LogOut size={16} style={{ marginRight: '4px' }} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', maxWidth: '1500px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
        {/* Left Sidebar - Categories */}
        <aside style={{
          background: '#fff',
          width: '220px',
          padding: '20px 0',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 70px)'
        }}>
          <h3 style={{
            padding: '0 20px',
            marginBottom: '15px',
            fontSize: '16px',
            fontWeight: '700',
            color: '#333'
          }}>
            Categories
          </h3>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: selectedCategory === category ? '#e8f0f9' : 'transparent',
                borderLeft: selectedCategory === category ? '3px solid #FF9900' : 'none',
                color: selectedCategory === category ? '#146eb4' : '#333',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedCategory === category ? '700' : '400',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {category}
            </button>
          ))}
        </aside>

        {/* Main Content - Products */}
        <main style={{
          flex: 1,
          padding: '20px'
        }}>
          {/* Results Info */}
          <div style={{
            marginBottom: '20px',
            fontSize: '14px',
            color: '#666'
          }}>
            Showing {filteredProducts.length} results
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` for "${searchQuery}"`}
          </div>

          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '1px solid #ddd'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Product Image */}
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: '#f5f5f5',
                  minHeight: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>

                {/* Product Info */}
                <div style={{ padding: '12px' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    lineHeight: '1.3',
                    color: '#333',
                    minHeight: '32px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.name}
                  </h3>

                  {/* Rating & Reviews */}
                  <div style={{
                    fontSize: '12px',
                    color: '#FF9900',
                    marginBottom: '8px'
                  }}>
                    {'⭐'.repeat(4)} 
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#B12704'
                    }}>
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <span style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: product.inStock ? '#4caf50' : '#f44336',
                    color: 'white',
                    borderRadius: '3px',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#FF9900',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: product.inStock ? 'pointer' : 'not-allowed',
                      opacity: product.inStock ? 1 : 0.5,
                      transition: 'background 0.2s'
                    }}
                    disabled={!product.inStock}
                    onMouseEnter={(e) => {
                      if (product.inStock) e.currentTarget.style.background = '#FF9900';
                    }}
                    onMouseLeave={(e) => {
                      if (product.inStock) e.currentTarget.style.background = '#FF9900';
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>No products found</p>
              <p style={{ fontSize: '14px' }}>Try adjusting your search or category filter</p>
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
 {selectedProduct && (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  }}>
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '640px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
      position: 'relative',
      animation: 'fadeIn 0.25s ease'
    }}>

      {/* Close */}
      <button
        onClick={() => {
          setSelectedProduct(null);
          setMessage('');
          setQuantity(1);
        }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: '#f0f0f0',
          border: 'none',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#555'
        }}
      >
        ✕
      </button>

      {/* Image */}
      <div style={{
        background: '#f5f5f5',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px'
      }}>
        <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '28px' }}>
        <h2 style={{
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#333'
        }}>
          {selectedProduct.name}
        </h2>

        {/* Rating */}
        <div style={{
          color: '#FF9900',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          ⭐⭐⭐⭐☆ <span style={{ color: '#666', fontSize: '14px' }}>(1,234 reviews)</span>
        </div>

        <p style={{
          color: '#666',
          fontSize: '15px',
          lineHeight: '1.7',
          marginBottom: '24px'
        }}>
          {selectedProduct.description}
        </p>

        {/* Price */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          background: '#fafafa',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{
              fontSize: '34px',
              fontWeight: '800',
              color: '#B12704'
            }}>
              ${selectedProduct.price.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              FREE Shipping
            </div>
          </div>

          <span style={{
            fontSize: '14px',
            padding: '8px 14px',
            borderRadius: '999px',
            background: selectedProduct.inStock ? '#d4edda' : '#f8d7da',
            color: selectedProduct.inStock ? '#155724' : '#721c24',
            fontWeight: '700'
          }}>
            {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Specs */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            Key Features
          </h4>
          <ul style={{
            padding: 0,
            margin: 0,
            listStyle: 'none',
            display: 'grid',
            gap: '10px'
          }}>
            {selectedProduct.specs?.map((spec, idx) => (
              <li key={idx} style={{
                background: '#f5f5f5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#555'
              }}>
                ✓ {spec}
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity */}
        {selectedProduct.inStock && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '14px',
            background: message.includes('✓') ? '#d4edda' : '#f8d7da',
            color: message.includes('✓') ? '#155724' : '#721c24'
          }}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '14px'
        }}>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setMessage('');
              setQuantity(1);
            }}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(221, 221, 221, 1)',
              background: '#f0f0f0',
              fontWeight: '700',
              cursor: 'pointer',
              color: 'black'
            }}
          >
            Close
          </Button>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedProduct.inStock}
            style={{
              flex: 1,
              padding: '5px',
              borderRadius: '10px',
              border: 'none',
              background: selectedProduct.inStock ? '#FF9900' : '#ccc',
              color: '#fff',
              fontWeight: '800',
              cursor: selectedProduct.inStock ? 'pointer' : 'not-allowed'
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
    </>
  );
}
