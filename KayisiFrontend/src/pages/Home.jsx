import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Resim listesi (Mobil için absolute URL temizliği)
const formatUrl = (url) => url ? url.replace('http://localhost:5054', '') : '';

const ProductCard = ({ product, quantities, handleQtyChange, addToCart }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const images = (product.imageUrls && product.imageUrls.length > 0) 
        ? product.imageUrls.map(formatUrl) 
        : (product.imageUrl ? [formatUrl(product.imageUrl)] : ['https://via.placeholder.com/150']);

  // Lightbox açıldığında arka plan kaymasını engelle
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxOpen]);

  // Otomatik kaydırma (Slider)
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      }, 3000); // 3 saniyede bir değiştir
      return () => clearInterval(interval);
    }
  }, [images.length]);

  return (
    <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} style={{ minHeight: '420px' }}>
      <div className="flip-card-inner">
        {/* ÖN YÜZ (FRONT) */}
        <div className="flip-card-front">
          <div style={{ height:'200px', width:'100%', overflow:'hidden', position:'relative' }}>
            <img 
              src={images[currentImageIndex]} 
              alt={product.name} 
              style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s', cursor:'pointer' }} 
              onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
              onClick={() => setLightboxOpen(true)}
            />
            {images.length > 1 && (
                <>
                    <button style={{position:'absolute', top:'50%', left:'5px', transform:'translateY(-50%)', background:'rgba(255,255,255,0.7)', border:'none', borderRadius:'50%', width:'25px', height:'25px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}>&#10094;</button>
                    <button style={{position:'absolute', top:'50%', right:'5px', transform:'translateY(-50%)', background:'rgba(255,255,255,0.7)', border:'none', borderRadius:'50%', width:'25px', height:'25px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}>&#10095;</button>
                    <div style={{position:'absolute', bottom:'5px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'4px'}}>
                        {images.map((_, i) => <div key={i} style={{width:'6px', height:'6px', borderRadius:'50%', background: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)'}}></div>)}
                    </div>
                </>
            )}
          </div>
          <div style={{ padding: '1.25rem', display:'flex', flexDirection:'column', flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.25rem' }}>
              <div>
                <h3 style={{ fontSize:'1.25rem', margin:0 }}>{product.name}</h3>
                {product.category && <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{product.category}</span>}
              </div>
              <span style={{ background:'#f1f5f9', padding:'0.2rem 0.5rem', borderRadius:'0.5rem', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                Stok: {product.stock > 0 ? product.stock : 'Tükendi'}
              </span>
            </div>
            
            <p style={{ fontSize:'1.5rem', fontWeight:'bold', color:'var(--text-main)', margin:'0 0 0.5rem 0' }}>
              {product.price} TL <span style={{fontSize:'1rem', color:'var(--text-muted)', fontWeight:'normal'}}>/ {product.unit || 'adet'}</span>
            </p>

            {/* Kısmi Açıklama ve Devamını Oku */}
            {product.description && (
              <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {product.description.length > 50 
                  ? product.description.substring(0, 50) + "..." 
                  : product.description}
                <button 
                  onClick={() => setIsFlipped(true)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 0 5px', fontSize: '0.9rem' }}
                >
                  Devamını Oku ↺
                </button>
              </div>
            )}
            
            <div style={{ marginTop:'auto', display:'flex', gap:'0.5rem' }}>
              <input 
                type="number" 
                min="1" 
                value={quantities[product.id] || 1} 
                onChange={e => handleQtyChange(product.id, parseInt(e.target.value))}
                className="input-field"
                style={{ width:'80px', textAlign:'center', padding: '0.5rem' }}
              />
              <button 
                className="btn btn-primary" 
                style={{ flex:1, padding: '0.5rem' }}
                onClick={() => addToCart(product, quantities[product.id])}
                disabled={product.stock <= 0}
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>

        {/* ARKA YÜZ (BACK) */}
        <div className="flip-card-back">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#38bdf8' }}>{product.name}</h3>
            <button 
              onClick={() => setIsFlipped(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', lineHeight: '1.6', fontSize: '0.95rem' }} className="no-scrollbar">
            {product.description || "Bu ürün için henüz bir açıklama eklenmemiş."}
          </div>
          <button 
            className="btn" 
            style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', width: '100%', fontWeight: 'bold' }}
            onClick={() => setIsFlipped(false)}
          >
            Geri Dön
          </button>
        </div>
      </div>

      {/* LIGHTBOX (Tam Ekran Resim) */}
      {lightboxOpen && createPortal(
        <div 
          style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.95)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
        >
          <img 
            src={images[currentImageIndex]} 
            alt={product.name} 
            style={{ maxWidth:'100%', maxHeight:'80vh', objectFit:'contain', padding: '0 1rem' }} 
            onClick={(e) => e.stopPropagation()}
          />
          
          <button 
            style={{ position:'absolute', top:'2rem', right:'1rem', background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'40px', height:'40px', color:'white', fontSize:'2rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(5px)', zIndex: 100000 }}
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            &times;
          </button>
          
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', gap: '2rem', zIndex: 100000 }}>
              <button style={{background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'50px', height:'50px', color:'white', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(5px)'}} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}>&#10094;</button>
              <button style={{background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'50px', height:'50px', color:'white', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(5px)'}} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}>&#10095;</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default function Home({ addToCart, searchQuery = '', storeSettings }) {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    Promise.all([
      fetch("/api/Products").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/Banners").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/Categories").then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([prodData, banData, catData]) => {
      setProducts(prodData || []);
      setBanners(banData || []);
      setCategories(catData || []);
      
      const initQty = {};
      (prodData || []).forEach(p => initQty[p.id] = 1);
      setQuantities(initQty);
      
      setLoading(false);
    }).catch(err => {
      console.error("Home data fetch error:", err);
      setLoading(false);
    });
  }, []);

  const handleQtyChange = (id, val) => {
    if(val < 1) val = 1;
    setQuantities(prev => ({...prev, [id]: val}));
  }

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Tümü' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const scrollRef = React.useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!scrollRef.current || banners.length <= 1) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (el) {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  if(loading) return <div className="container-fluid" style={{padding:'4rem 1.5rem', textAlign:'center'}}>Yükleniyor...</div>;

  return (
    <div>
      {/* Hero / Banners Section */}
      {banners.length > 0 && (
        <div style={{ background:'#1e293b', color:'white', padding:'2rem 0', marginBottom:'3rem', position: 'relative' }}>
          
          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button 
                onClick={scrollLeft}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
              >
                &#10094;
              </button>
              <button 
                onClick={scrollRight}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
              >
                &#10095;
              </button>
            </>
          )}

          <div 
            ref={scrollRef}
            className="container-fluid no-scrollbar" 
            style={{display:'flex', overflowX:'auto', gap:'2rem', scrollSnapType:'x mandatory', scrollBehavior: 'smooth'}}
          >
            {banners.map(b => (
              <div key={b.id} style={{ 
                  minWidth:'100%', 
                  scrollSnapAlign:'center', 
                  position:'relative', 
                  borderRadius:'1rem', 
                  overflow:'hidden',
                  height: '300px', // Daha küçük afiş boyutu
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000'
              }}>
                {/* Arka plan bulanıklığı için aynı resim */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${formatUrl(b.imageUrl)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(20px)',
                  opacity: 0.5,
                  zIndex: 1
                }}></div>
                
                {/* Ana resim (bozulmadan ortalanır) */}
                <img 
                  src={formatUrl(b.imageUrl)} 
                  alt={b.title} 
                  style={{ width:'100%', height:'100%', objectFit:'contain', zIndex: 2, position: 'relative' }} 
                />
                
                {b.title && (
                  <div style={{ position:'absolute', bottom:'1rem', left:'2rem', right:'2rem', zIndex: 3 }}>
                    <h2 style={{ fontSize:'2rem', textShadow:'0 2px 8px rgba(0,0,0,0.8)' }}>{b.title}</h2>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div id="kategoriler" className="container-fluid" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeCategory === 'Tümü' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('Tümü')}
            style={{ whiteSpace: 'nowrap' }}
          >
            Tümü
          </button>
          {categories.map(c => (
            <button 
              key={c.id} 
              className={`btn ${activeCategory === c.name ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveCategory(c.name)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div id="urunler" className="container-fluid" style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color:'var(--primary)' }}>Doğal & Yöresel Ürünlerimiz</h2>
        <div className="grid-cols-auto">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} quantities={quantities} handleQtyChange={handleQtyChange} addToCart={addToCart} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p style={{textAlign:'center', color:'var(--text-muted)'}}>Şu an ürün bulunmamaktadır.</p>
        )}
      </div>

      {/* Biz Kimiz & Footer (SEO Friendly) */}
      <footer style={{ background: '#1e293b', color: 'white', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
        <div className="container-fluid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          {/* Hakkımızda / SEO Metni */}
          <div id="hakkimizda">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Biz Kimiz?</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
              <strong>{storeSettings?.storeName || 'Irmak Kayısı'}</strong> olarak {storeSettings?.aboutUs || 'en taze, en doğal ve en kaliteli yöresel ürünleri, kuru meyveleri ve çerezleri doğrudan üreticiden alıp sofralarınıza getiriyoruz.'}
            </p>
          </div>

          {/* İletişim Bilgileri */}
          <div id="iletisim">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>İletişim & Adres</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', lineHeight: '2' }}>
              <li>
                📍 <strong>Adres:</strong> {storeSettings?.address} <br/> <a href={storeSettings?.mapUrl} target="_blank" rel="noreferrer" style={{color:'#38bdf8', textDecoration:'none', fontSize:'0.9rem'}}>Haritada Gör</a>
              </li>
              <li>📞 <strong>Telefon:</strong> {storeSettings?.phoneNumber}</li>
              <li>📷 <strong>Instagram:</strong> <a href={storeSettings?.instagramUrl} target="_blank" rel="noreferrer" style={{color:'#38bdf8', textDecoration:'none'}}>Takip Et</a></li>
              <li>✉️ <strong>E-Posta:</strong> {storeSettings?.contactEmail}</li>
            </ul>
          </div>

          {/* Hızlı WhatsApp İletişim Formu */}
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Bize Ulaşın</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const msg = e.target.message.value;
                const phone = storeSettings?.phoneNumber.replace(/\s+/g, '').replace(/^0/, '') || '5315930244';
                window.open(`https://wa.me/90${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                e.target.reset();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <textarea 
                name="message"
                className="input-field" 
                placeholder="Mesajınızı yazın..." 
                rows="3" 
                required 
                style={{ resize: 'vertical' }}
              ></textarea>
              <button type="submit" className="btn btn-secondary">WhatsApp'tan Gönder</button>
            </form>
          </div>

        </div>
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '3rem', fontSize: '0.9rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
          &copy; {new Date().getFullYear()} {storeSettings?.storeName || 'Irmak Kayısı'}. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
