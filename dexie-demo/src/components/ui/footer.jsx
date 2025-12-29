import { Card } from "@/components/ui/card";
import { MapPin, ShoppingCart, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(180deg,#0b1220,#071025)', color: '#cbd5e1', padding: '28px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Card style={{ padding: 18, minWidth: 260, background: 'transparent', border: '1px solid rgba(255,255,255,0.03)', color: '#cbd5e1' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>ShopEase</div>
          <div style={{ marginTop: 8, color: '#9ca3af', fontSize: 13 }}>Your friendly demo marketplace — curated products, easy checkout.</div>
        </Card>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, justifyContent: 'space-around', minWidth: 360 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>Explore</div>
            <ul style={{ marginTop: 8, listStyle: 'none', padding: 0, color: '#9ca3af' }}>
              <li style={{ marginTop: 8, cursor: 'pointer' }}>Marketplace</li>
              <li style={{ marginTop: 8, cursor: 'pointer' }}>Categories</li>
              <li style={{ marginTop: 8, cursor: 'pointer' }}>Deals</li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>Company</div>
            <ul style={{ marginTop: 8, listStyle: 'none', padding: 0, color: '#9ca3af' }}>
              <li style={{ marginTop: 8 }}>About</li>
              <li style={{ marginTop: 8 }}>Careers</li>
              <li style={{ marginTop: 8 }}>Contact</li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>Contact</div>
            <div style={{ marginTop: 8, color: '#9ca3af' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MapPin size={14} /> 123 Demo St.</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}><ShoppingCart size={14} /> support@shopease.example</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
