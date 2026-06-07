import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import { ShoppingBag, Phone, MapPin, Menu, Search } from 'lucide-react'

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    fetch("/api/Settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setStoreSettings(data);
      })
      .catch(err => console.error("Settings fetch error:", err));
  }, []);
  
  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync cart across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && e.newValue) {
        setCartItems(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart Functions
  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    // setCartOpen(true); -> İptal edildi, artık alttan bar çıkacak
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) return removeFromCart(id);
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const sendWhatsAppOrder = async () => {
    if (cartItems.length === 0 || !storeSettings) return;

    try {
      const checkoutItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const res = await fetch("/api/erp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutItems)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Sipariş verilemedi. Stok yetersiz olabilir.");
        return;
      }
    } catch (err) {
      alert("Stok kontrolü yapılırken sunucu bağlantı hatası oluştu.");
      return;
    }

    let message = "Merhaba, sipariş vermek istiyorum:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.quantity} ${item.unit || 'adet'} ${item.name} (${item.price * item.quantity} TL)\n`;
    });
    message += `\nToplam: ${cartTotal} TL`;
    const encoded = encodeURIComponent(message);
    const phone = storeSettings.phoneNumber.replace(/\s+/g, ''); // 0531... -> remove spaces
    window.open(`https://wa.me/90${phone.startsWith('0') ? phone.slice(1) : phone}?text=${encoded}`, "_blank");
    setCartItems([]);
    setCartOpen(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav className="navbar glass">
          <div className="container">
            <Link to="/" className="logo">
              <img 
                src="/images/site-logo.png" 
                onError={(e) => { 
                  if (!e.target.dataset.errorHandled) {
                    e.target.dataset.errorHandled = true;
                    e.target.src="/vite.svg"; 
                  }
                }} 
                alt="Logo" 
                style={{ height: '40px', objectFit: 'contain' }} 
              />
              <span className="hide-mobile">{storeSettings?.storeName || 'Irmak Kayısı'}</span>
            </Link>
            <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '400px', margin: '0 1rem', background: 'rgba(255,255,255,0.8)', padding: '0.4rem 0.8rem', borderRadius: '2rem', border: '1px solid var(--glass-border)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Ürün ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
            <div className="nav-actions">
              <button className="btn btn-outline" style={{padding:'0.5rem 0.8rem'}} onClick={() => setMenuOpen(true)}>
                <Menu size={20} />
              </button>
              <button className="btn btn-primary" style={{padding:'0.5rem 0.8rem'}} onClick={() => setCartOpen(true)}>
                <ShoppingBag size={20} />
                <span className="hide-mobile">Sepet ({cartItems.length})</span>
                <span className="show-mobile-inline" style={{display:'none'}}>{cartItems.length}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hamburger Menu Overlay & Sidebar */}
        <div className={`cart-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} style={{zIndex: 54}}></div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '2rem' }}>
            <h2 style={{margin:0, color:'var(--primary)'}}>Menü</h2>
            <button style={{background:'none', border:'none', fontSize:'2rem', cursor:'pointer'}} onClick={() => setMenuOpen(false)}>&times;</button>
          </div>
          <a href="#" onClick={() => setMenuOpen(false)}>Ana Sayfa</a>
          <a href="#kategoriler" onClick={() => setMenuOpen(false)}>Kategoriler</a>
          <a href="#urunler" onClick={() => setMenuOpen(false)}>Ürünler</a>
          <a href="#hakkimizda" onClick={() => setMenuOpen(false)}>Hakkımızda</a>
          <a href="#iletisim" onClick={() => setMenuOpen(false)}>İletişim</a>
        </div>

        {/* Floating Actions */}
        <div className="floating-actions">
          {storeSettings && (
            <>
              <a href={`https://wa.me/90${storeSettings.phoneNumber.replace(/\s+/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="float-btn bg-whatsapp" title="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 438c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 54.3 0 105.4 21.2 143.8 59.6 38.4 38.4 59.5 89.5 59.5 143.8 0 101.7-82.8 184.5-184.5 184.5zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.7 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
              </a>
              <a href={storeSettings.instagramUrl} target="_blank" rel="noreferrer" className="float-btn bg-instagram" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href={storeSettings.mapUrl} target="_blank" rel="noreferrer" className="float-btn bg-location" title="Konum">
                <MapPin size={24} />
              </a>
            </>
          )}
        </div>

        {/* Cart Overlay & Sidebar */}
        <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}></div>
        <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{margin:0}}>Sepetim</h2>
            <button style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}} onClick={() => setCartOpen(false)}>&times;</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {cartItems.length === 0 ? (
              <p style={{textAlign:'center', color:'var(--text-muted)'}}>Sepetiniz boş.</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} style={{ display:'flex', gap:'1rem', marginBottom:'1rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'1rem' }}>
                  <img src={item.imageUrl} alt={item.name} style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'8px'}} />
                  <div style={{ flex:1 }}>
                    <h4 style={{margin:0}}>{item.name}</h4>
                    <p style={{margin:0, color:'var(--text-muted)', fontSize:'0.9rem'}}>{item.price} TL / {item.unit}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem' }}>
                      <button className="btn" style={{padding:'0.2rem 0.6rem', border:'1px solid #cbd5e1'}} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="btn" style={{padding:'0.2rem 0.6rem', border:'1px solid #cbd5e1'}} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div style={{fontWeight:'bold'}}>
                    {item.price * item.quantity} TL
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', fontSize:'1.2rem', fontWeight:'bold' }}>
              <span>Toplam:</span>
              <span>{cartTotal} TL</span>
            </div>
            <button className="btn btn-secondary" style={{width:'100%'}} onClick={sendWhatsAppOrder} disabled={cartItems.length===0}>
              <Phone size={20} />
              WhatsApp'tan Gönder
            </button>
          </div>
        </div>

        {/* Sticky Cart Bar */}
        <div className={`sticky-cart-bar ${cartItems.length > 0 && !cartOpen ? 'visible' : ''}`}>
          <div style={{display:'flex', alignItems:'center', gap:'1rem', fontSize:'1.1rem', fontWeight:'bold'}}>
            <ShoppingBag size={24} />
            <span>Sepetinizde {cartItems.length} ürün var ({cartTotal} TL)</span>
          </div>
          <button className="btn btn-secondary" onClick={() => setCartOpen(true)} style={{padding:'0.5rem 2rem'}}>
            Siparişi Tamamla
          </button>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} searchQuery={searchQuery} storeSettings={storeSettings} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
