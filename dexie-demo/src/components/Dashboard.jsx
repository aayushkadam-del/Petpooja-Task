import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut, ShoppingCart, Package, MapPin, Home } from 'lucide-react';
import { Card } from "@/components/ui/card";
import Footer from "@/components/ui/footer";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const [index, setIndex] = useState(0);

  const slides = [
    { title: 'Discover New Arrivals', subtitle: 'Hand-picked items for you', img: 'https://images.unsplash.com/photo-1542293787938-c9e299b880f2?w=1200&q=80' },
    { title: 'Seasonal Deals', subtitle: 'Save big on favorites', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80' },
    { title: 'Shop Best Sellers', subtitle: 'Top-rated by other shoppers', img: 'https://images.unsplash.com/photo-1526178612437-5f7b5d2d6b89?w=1200&q=80' }
  ];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f7f7fb 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'linear-gradient(90deg,#0f172a,#0b1220)', color: 'white', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 60 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Home size={26} style={{ color: '#FFA500' }} />
            <div>
              <div style={{ fontSize: '14px', color: '#ddd' }}>Hello,</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentUser?.name || 'Shopper'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => navigate('/marketplace')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Marketplace</button>
            <button onClick={handleLogout} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#FFA500', color: '#0b1220', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}><LogOut size={16}/>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ width: '100%', maxWidth: 1400, margin: '28px auto', padding: '0 20px', flex: 1 }}>
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Carousel / Hero */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(13, 30, 91, 0.08)' }}>
            {slides.map((s, i) => (
              <div key={i} style={{ backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 360, transition: 'opacity 600ms ease', opacity: i === index ? 1 : 0, position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', padding: '24px', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%)', color: 'white' }}>
                  <h3 style={{ fontSize: 22, margin: 0 }}>{s.title}</h3>
                  <p style={{ marginTop: 6 }}>{s.subtitle}</p>
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', gap: 8 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} style={{ width: 10, height: 10, borderRadius: 10, background: i === index ? '#FFA500' : 'rgba(255,255,255,0.6)', border: 'none', cursor: 'pointer' }} aria-label={`Go to slide ${i+1}`} />
              ))}
            </div>
          </div>

          {/* Quick Account Card */}
          <Card style={{ padding: 20, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Account</div>
                <div style={{ fontSize: 18, marginTop: 6, fontWeight: 700 }}>{currentUser?.name || 'Shopper'}</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>{currentUser?.email || 'No email set'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => navigate('/user-products')} style={{ background: '#0f172a', color: 'white', borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer' }}>My Products</button>
                <button onClick={() => navigate('/orders')} style={{ background: '#fff', color: '#0f172a', border: '1px solid #e6edf3', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Orders</button>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Phone</div>
                <div style={{ fontWeight: 700 }}>{currentUser?.phone || '—'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Joined</div>
                <div style={{ fontWeight: 700 }}>{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Navigation / Actions */}
        <section style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          <Card onClick={() => navigate('/marketplace')} style={{ padding: 20, cursor: 'pointer', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: '#FFF4E5', padding: 12, borderRadius: 10 }}><ShoppingCart size={28} style={{ color: '#FF9900' }} /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Shop Products</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Browse curated catalog</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/cart')} style={{ padding: 20, cursor: 'pointer', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: '#E8F3FF', padding: 12, borderRadius: 10 }}><Package size={28} style={{ color: '#0077c8' }} /></div>
              <div>
                <div style={{ fontWeight: 700 }}>My Cart</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Review and checkout</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/orders')} style={{ padding: 20, cursor: 'pointer', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: '#EFF9F0', padding: 12, borderRadius: 10 }}><MapPin size={28} style={{ color: '#16a34a' }} /></div>
              <div>
                <div style={{ fontWeight: 700 }}>Orders</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Track shipments</div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
