import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Package, Plus, Trash2, List, Edit, BarChart3, Truck } from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [erpDashboard, setErpDashboard] = useState({
    totalProducts: 0, totalStock: 0, criticalStockCount: 0, supplierCount: 0
  });
  const [criticalProducts, setCriticalProducts] = useState([]);

  // Supplier Form States
  const [supId, setSupId] = useState(null);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');

  // Product Form States
  const [pId, setPId] = useState(null); // If null -> Add mode, else Edit mode
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pStock, setPStock] = useState('100');
  const [pUnit, setPUnit] = useState('kg');
  const [pCategory, setPCategory] = useState('');
  const [pFiles, setPFiles] = useState([]); // Multiple files
  const [pExistingImage, setPExistingImage] = useState('');
  const [pExistingImageUrls, setPExistingImageUrls] = useState([]); // Multiple existing images
  const [pSupplierId, setPSupplierId] = useState('');

  // Banner Form States
  const [bTitle, setBTitle] = useState('');
  const [bFile, setBFile] = useState(null);

  // Category Form States
  const [cName, setCName] = useState('');

  // Settings Form States
  const [logoFile, setLogoFile] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    storeName: '', address: '', instagramUrl: '', phoneNumber: '', contactEmail: '', mapUrl: '', aboutUs: ''
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchAll = () => {
    fetch("/api/Products").then(res => res.json()).then(setProducts);
    fetch("/api/Banners").then(res => res.json()).then(setBanners);
    fetch("/api/Categories").then(res => res.json()).then(data => {
        setCategories(data);
        if(data.length > 0 && !pCategory) setPCategory(data[0].name);
    });
    fetch("/api/Settings").then(res => res.json()).then(data => {
        if(data) setStoreSettings(data);
    });
    fetch("/api/Suppliers").then(res => res.ok ? res.json() : []).then(setSuppliers);
  };

  const fetchErpData = () => {
    fetch("/api/erp/dashboard")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if(data) setErpDashboard(data); });

    fetch("/api/erp/critical-products")
      .then(res => res.ok ? res.json() : [])
      .then(setCriticalProducts);
  };

  const handleEditSupplierClick = (s) => {
    setSupId(s.id);
    setSupName(s.name);
    setSupPhone(s.phone);
  };

  const resetSupplierForm = () => {
    setSupId(null);
    setSupName('');
    setSupPhone('');
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    const supData = { name: supName, phone: supPhone };

    if (supId) {
      fetch(`/api/Suppliers/${supId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supData)
      }).then(() => {
        alert("Tedarikçi güncellendi!");
        resetSupplierForm();
        fetchAll();
        fetchErpData();
      });
    } else {
      fetch("/api/Suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supData)
      }).then(() => {
        alert("Tedarikçi eklendi!");
        resetSupplierForm();
        fetchAll();
        fetchErpData();
      });
    }
  };

  const handleDeleteSupplier = (id) => {
    if (!window.confirm("Bu tedarikçiyi silmek istediğinize emin misiniz? Bağlı ürünlerin tedarikçi bilgisi silinecektir.")) return;
    fetch(`/api/Suppliers/${id}`, { method: "DELETE" }).then(() => {
      alert("Tedarikçi silindi!");
      fetchAll();
      fetchErpData();
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
      fetchErpData();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/Settings/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pin })
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        alert(data.message || 'Hatalı Şifre!');
      }
    } catch (err) {
      alert("Giriş sırasında bir hata oluştu.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return alert("Lütfen tüm alanları doldurun.");
    try {
      const res = await fetch("/api/Settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Şifre başarıyla güncellendi!");
        setOldPassword('');
        setNewPassword('');
      } else {
        alert(data.message || "Şifre güncellenemedi.");
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const uploadImage = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/Products/upload", {
        method: "POST",
        body: formData
    });
    const uploadData = await uploadRes.json();
    return uploadData.imageUrl;
  };

  const uploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return alert("Lütfen bir resim seçin!");
    const formData = new FormData();
    formData.append("file", logoFile);
    await fetch("/api/Settings/logo", {
        method: "POST",
        body: formData
    });
    alert("Logo güncellendi! Sayfayı yenilediğinizde aktif olacaktır.");
    setLogoFile(null);
  };

  // --- PRODUCT CRUD ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // Yüklenen yeni dosyaların URL'lerini al
    let newUrls = [];
    if (pFiles && pFiles.length > 0) {
        for(let i=0; i<pFiles.length; i++) {
            const url = await uploadImage(pFiles[i]);
            if(url) newUrls.push(url);
        }
    }

    // Mevcut resimlerle yenileri birleştir
    const finalImageUrls = [...pExistingImageUrls, ...newUrls];
    // Ana resim olarak ilk resmi kullan (Geriye dönük uyumluluk için)
    const finalImageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : (pExistingImage || "https://via.placeholder.com/150");

    const productData = {
        name: pName,
        price: parseFloat(pPrice),
        description: pDescription,
        stock: parseInt(pStock),
        unit: pUnit,
        category: pCategory,
        imageUrl: finalImageUrl,
        imageUrls: finalImageUrls,
        supplierId: pSupplierId ? parseInt(pSupplierId) : null
    };

    if (pId) { // Update
        fetch(`/api/Products/${pId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        }).then(() => {
            alert("Ürün güncellendi!");
            resetProductForm();
            fetchAll();
        });
    } else { // Add
        fetch("/api/Products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        }).then(() => {
            alert("Ürün eklendi!");
            resetProductForm();
            fetchAll();
        });
    }
  };

  const handleEditClick = (p) => {
      setPId(p.id);
      setPName(p.name);
      setPPrice(p.price);
      setPDescription(p.description || '');
      setPStock(p.stock);
      setPUnit(p.unit);
      setPCategory(p.category || '');
      setPExistingImage(p.imageUrl);
      setPExistingImageUrls(p.imageUrls || (p.imageUrl ? [p.imageUrl] : []));
      setPSupplierId(p.supplierId || '');
      setPFiles([]);
  };

  const resetProductForm = () => {
      setPId(null);
      setPName('');
      setPPrice('');
      setPDescription('');
      setPStock('100');
      setPUnit('kg');
      setPExistingImage('');
      setPExistingImageUrls([]);
      setPSupplierId('');
      setPFiles([]);
  }

  const handleDeleteProduct = (id) => {
    if(!window.confirm('Emin misiniz?')) return;
    fetch(`/api/Products/${id}`, { method: 'DELETE' }).then(fetchAll);
  };

  // --- BANNER CRUD ---
  const [bId, setBId] = useState(null);

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    let imageUrl = bFile ? await uploadImage(bFile) : '';

    if (bId) {
        // Find existing banner to keep old image if no new file
        const existingBanner = banners.find(b => b.id === bId);
        const finalImageUrl = imageUrl || (existingBanner ? existingBanner.imageUrl : '');

        fetch(`/api/Banners/${bId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: bTitle, imageUrl: finalImageUrl })
        }).then(() => {
            alert("Afiş güncellendi!");
            resetBannerForm();
            fetchAll();
        });
    } else {
        if (!imageUrl) return alert("Lütfen afiş resmi seçin!");
        fetch("/api/Banners", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: bTitle, imageUrl: imageUrl })
        }).then(() => {
            alert("Afiş eklendi!");
            resetBannerForm();
            fetchAll();
        });
    }
  };

  const handleEditBanner = (b) => {
      setBId(b.id);
      setBTitle(b.title || '');
      setBFile(null);
  };

  const resetBannerForm = () => {
      setBId(null);
      setBTitle('');
      setBFile(null);
  };

  const handleDeleteBanner = (id) => {
    if(!window.confirm('Emin misiniz?')) return;
    fetch(`/api/Banners/${id}`, { method: 'DELETE' }).then(fetchAll);
  };

  // --- CATEGORY CRUD ---
  const handleAddCategory = (e) => {
      e.preventDefault();
      fetch("/api/Categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cName })
      }).then(() => {
          setCName('');
          fetchAll();
      });
  };

  const handleDeleteCategory = (id) => {
      if(!window.confirm('Emin misiniz?')) return;
      fetch(`/api/Categories/${id}`, { method: 'DELETE' }).then(fetchAll);
  };

  if (!isAuthenticated) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc'}}>
        <div className="glass" style={{padding:'3rem', borderRadius:'1rem', width:'100%', maxWidth:'400px', textAlign:'center'}}>
          <Settings size={48} color="var(--primary)" style={{marginBottom:'1rem'}} />
          <h2 style={{marginBottom:'2rem'}}>Yönetici Girişi</h2>
          <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Şifre (1234)" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }) => (
    <li>
        <button 
        style={{width:'100%', textAlign:'left', padding:'1rem', background: activeTab === id ? '#334155' : 'transparent', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem'}}
        onClick={() => setActiveTab(id)}
        >
        <Icon size={20} /> {label}
        </button>
    </li>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2 style={{marginBottom:'2rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
          <Settings size={24} /> Panel
        </h2>
        <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          <TabButton id="erp" icon={BarChart3} label="ERP Dashboard" />
          <TabButton id="products" icon={Package} label="Ürünler" />
          <TabButton id="suppliers" icon={Truck} label="Tedarikçiler" />
          <TabButton id="categories" icon={List} label="Kategoriler" />
          <TabButton id="banners" icon={ImageIcon} label="Afişler" />
          <TabButton id="settings" icon={Settings} label="Site Ayarları" />
        </ul>
      </div>

      {/* Content */}
      <div className="admin-content">
        <div className="glass" style={{padding:'2rem', borderRadius:'1rem', background:'white'}}>
          
          {/* --- PRODUCTS TAB --- */}
          {activeTab === 'products' && (
            <div>
              <h2 style={{marginBottom:'2rem'}}>Ürün Yönetimi</h2>
              
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', marginBottom:'2rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>{pId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                    {pId && <button className="btn btn-outline" style={{padding:'0.5rem'}} onClick={resetProductForm}>İptal (Yeni Ekle'ye Dön)</button>}
                </div>
                <form onSubmit={handleSaveProduct} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1rem'}}>
                  <input type="text" className="input-field" placeholder="Ürün Adı" value={pName} onChange={e=>setPName(e.target.value)} required />
                  <input type="number" className="input-field" placeholder="Fiyat (TL)" value={pPrice} onChange={e=>setPPrice(e.target.value)} required />
                  <textarea className="input-field" placeholder="Ürün Açıklaması (Ters dönünce görünecek)" value={pDescription} onChange={e=>setPDescription(e.target.value)} rows="3" style={{gridColumn:'span 2', resize:'vertical'}}></textarea>
                  <input type="number" className="input-field" placeholder="Stok" value={pStock} onChange={e=>setPStock(e.target.value)} required />
                  <select className="input-field" value={pUnit} onChange={e=>setPUnit(e.target.value)}>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="adet">Adet</option>
                    <option value="gram">Gram</option>
                    <option value="kutu">Kutu</option>
                    <option value="paket">Paket</option>
                  </select>
                  <select className="input-field" value={pCategory} onChange={e=>setPCategory(e.target.value)}>
                    <option value="">Kategori Seçin</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <select className="input-field" value={pSupplierId} onChange={e=>setPSupplierId(e.target.value)}>
                    <option value="">Tedarikçi Seçin (İsteğe bağlı)</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div style={{gridColumn:'span 2'}}>
                    <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Ürün Resimleri</label>
                    <input type="file" className="input-field" multiple onChange={e=>setPFiles(Array.from(e.target.files))} />
                    
                    {pExistingImageUrls.length > 0 && (
                        <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap'}}>
                            {pExistingImageUrls.map((url, i) => (
                                <div key={i} style={{position:'relative'}}>
                                    <img src={url} alt="Ekli" style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'0.25rem', border:'1px solid #ccc'}} />
                                    <button 
                                        type="button" 
                                        style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer'}}
                                        onClick={() => setPExistingImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                                    >&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}}>
                      {pId ? <><Edit size={20}/> Güncelle</> : <><Plus size={20}/> Ürün Ekle</>}
                  </button>
                </form>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {products.map(p => (
                  <div key={p.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                      <img src={p.imageUrl} alt={p.name} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'0.25rem'}} />
                      <div>
                        <strong>{p.name}</strong> - {p.price} TL / {p.unit} (Stok: {p.stock}) <br/>
                        <span style={{fontSize:'0.8rem', color:'gray'}}>Kategori: {p.category || 'Belirtilmedi'} | Tedarikçi: {p.supplier ? p.supplier.name : 'Atanmamış'}</span>
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                        <button className="btn" style={{background:'#3b82f6', color:'white', padding:'0.5rem 1rem'}} onClick={() => handleEditClick(p)}>
                        <Edit size={16}/> Düzenle
                        </button>
                        <button className="btn" style={{background:'#ef4444', color:'white', padding:'0.5rem 1rem'}} onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 size={16}/> Sil
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- CATEGORIES TAB --- */}
          {activeTab === 'categories' && (
            <div>
              <h2 style={{marginBottom:'2rem'}}>Kategori Yönetimi</h2>
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', marginBottom:'2rem'}}>
                <h3>Yeni Kategori Ekle</h3>
                <form onSubmit={handleAddCategory} style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
                  <input type="text" className="input-field" placeholder="Örn: Kuru Meyve" value={cName} onChange={e=>setCName(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{whiteSpace:'nowrap'}}><Plus size={20}/> Ekle</button>
                </form>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                {categories.map(c => (
                  <div key={c.id} style={{display:'flex', justifyContent:'space-between', padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem'}}>
                    <strong>{c.name}</strong>
                    <button className="btn" style={{background:'#ef4444', color:'white', padding:'0.2rem 0.5rem'}} onClick={() => handleDeleteCategory(c.id)}>Sil</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- BANNERS TAB --- */}
          {activeTab === 'banners' && (
            <div>
              <h2 style={{marginBottom:'2rem'}}>Afiş Yönetimi</h2>
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', marginBottom:'2rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>{bId ? 'Afişi Düzenle' : 'Yeni Afiş Ekle'}</h3>
                    {bId && <button className="btn btn-outline" style={{padding:'0.5rem'}} onClick={resetBannerForm}>İptal (Yeni Ekle'ye Dön)</button>}
                </div>
                <form onSubmit={handleSaveBanner} style={{display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1rem'}}>
                  <input type="text" className="input-field" placeholder="Afiş Başlığı (İsteğe bağlı)" value={bTitle} onChange={e=>setBTitle(e.target.value)} />
                  <input type="file" className="input-field" onChange={e=>setBFile(e.target.files[0])} required={!bId} />
                  {bId && <small style={{color:'gray'}}>Resmi değiştirmek istemiyorsanız dosya seçmeyin.</small>}
                  <button type="submit" className="btn btn-primary">
                      {bId ? <><Edit size={20}/> Güncelle</> : <><Plus size={20}/> Afiş Ekle</>}
                  </button>
                </form>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                {banners.map(b => (
                  <div key={b.id} style={{position:'relative', borderRadius:'0.5rem', overflow:'hidden', border:'1px solid #e2e8f0'}}>
                    <img src={b.imageUrl} alt={b.title} style={{width:'100%', height:'200px', objectFit:'cover'}} />
                    <div style={{position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.5)', color:'white', padding:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span>{b.title || 'İsimsiz Afiş'}</span>
                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <button className="btn" style={{background:'#3b82f6', color:'white', padding:'0.2rem 0.5rem'}} onClick={() => handleEditBanner(b)}>Düzenle</button>
                        <button className="btn" style={{background:'#ef4444', color:'white', padding:'0.2rem 0.5rem'}} onClick={() => handleDeleteBanner(b.id)}>Sil</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
              <h2 style={{margin:0}}>Site Ayarları</h2>
              
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem'}}>
                <h3 style={{marginBottom:'1rem'}}>Site Logosu</h3>
                <p style={{color:'gray', fontSize:'0.9rem', marginBottom:'1rem'}}>Sitenin sol üst köşesindeki logoyu değiştirmek için buradan resim yükleyebilirsiniz. (Önerilen: Şeffaf arka planlı PNG)</p>
                <form onSubmit={uploadLogo} style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                  <input type="file" className="input-field" onChange={e=>setLogoFile(e.target.files[0])} required />
                  <button type="submit" className="btn btn-primary" style={{whiteSpace:'nowrap'}}>Logoyu Güncelle</button>
                </form>
              </div>

              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem'}}>
                <h3 style={{marginBottom:'1rem'}}>Dükkan & İletişim Bilgileri</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    fetch("/api/Settings", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(storeSettings)
                    }).then(() => alert("Ayarlar güncellendi!"));
                }} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label>Dükkan Adı</label>
                        <input className="input-field" value={storeSettings.storeName} onChange={e=>setStoreSettings({...storeSettings, storeName: e.target.value})} />
                    </div>
                    
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label>Telefon Numarası</label>
                        <input className="input-field" value={storeSettings.phoneNumber} onChange={e=>setStoreSettings({...storeSettings, phoneNumber: e.target.value})} />
                    </div>

                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label>E-Posta</label>
                        <input className="input-field" value={storeSettings.contactEmail} onChange={e=>setStoreSettings({...storeSettings, contactEmail: e.target.value})} />
                    </div>

                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label>Instagram Linki</label>
                        <input className="input-field" value={storeSettings.instagramUrl} onChange={e=>setStoreSettings({...storeSettings, instagramUrl: e.target.value})} />
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gridColumn:'span 2'}}>
                        <label>Fiziksel Adres</label>
                        <input className="input-field" value={storeSettings.address} onChange={e=>setStoreSettings({...storeSettings, address: e.target.value})} />
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gridColumn:'span 2'}}>
                        <label>Harita Linki (Google Maps Share Link)</label>
                        <input className="input-field" value={storeSettings.mapUrl} onChange={e=>setStoreSettings({...storeSettings, mapUrl: e.target.value})} />
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gridColumn:'span 2'}}>
                        <label>Hakkımızda Yazısı</label>
                        <textarea className="input-field" rows="4" value={storeSettings.aboutUs} onChange={e=>setStoreSettings({...storeSettings, aboutUs: e.target.value})}></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}}>Bilgileri Kaydet</button>

                </form>
              </div>

              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem'}}>
                <h3 style={{marginBottom:'1rem'}}>Yönetici Şifresini Değiştir</h3>
                <form onSubmit={handleChangePassword} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    <div>
                        <label style={{display:'block', marginBottom:'0.5rem'}}>Mevcut Şifre</label>
                        <input type="password" className="input-field" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{display:'block', marginBottom:'0.5rem'}}>Yeni Şifre</label>
                        <input type="password" className="input-field" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{alignSelf:'flex-start'}}>Şifreyi Değiştir</button>
                </form>
              </div>
            </div>
          )}

          {/* --- ERP DASHBOARD TAB --- */}
          {activeTab === 'erp' && (
            <div>
              <h2 style={{marginBottom:'2rem'}}>ERP Dashboard</h2>

              {/* Stat Cards */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.5rem', marginBottom:'3rem'}}>
                <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', borderLeft:'4px solid #3b82f6'}}>
                  <span style={{fontSize:'0.9rem', color:'gray', fontWeight:'bold'}}>Toplam Ürün Sayısı</span>
                  <h3 style={{fontSize:'2rem', margin:'0.5rem 0 0 0', color:'#1e293b'}}>{erpDashboard.totalProducts}</h3>
                </div>
                <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', borderLeft:'4px solid #10b981'}}>
                  <span style={{fontSize:'0.9rem', color:'gray', fontWeight:'bold'}}>Toplam Stok Miktarı</span>
                  <h3 style={{fontSize:'2rem', margin:'0.5rem 0 0 0', color:'#1e293b'}}>{erpDashboard.totalStock}</h3>
                </div>
                <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', borderLeft: erpDashboard.criticalStockCount > 0 ? '4px solid #ef4444' : '4px solid #e2e8f0'}}>
                  <span style={{fontSize:'0.9rem', color:'gray', fontWeight:'bold'}}>Kritik Stoktaki Ürünler</span>
                  <h3 style={{fontSize:'2rem', margin:'0.5rem 0 0 0', color: erpDashboard.criticalStockCount > 0 ? '#ef4444' : '#1e293b'}}>{erpDashboard.criticalStockCount}</h3>
                </div>
                <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', borderLeft:'4px solid #8b5cf6'}}>
                  <span style={{fontSize:'0.9rem', color:'gray', fontWeight:'bold'}}>Toplam Tedarikçi Sayısı</span>
                  <h3 style={{fontSize:'2rem', margin:'0.5rem 0 0 0', color:'#1e293b'}}>{erpDashboard.supplierCount}</h3>
                </div>
              </div>

              {/* Critical Stock list */}
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem'}}>
                <h3 style={{marginBottom:'1rem', color:'#ef4444', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  ⚠️ Kritik Stok ve Tedarikçi Önerileri
                </h3>
                <p style={{fontSize:'0.9rem', color:'gray', marginBottom:'1.5rem'}}>
                  Aşağıdaki ürünlerin stok miktarları kritik eşiğin (10) altındadır. Sipariş geçilebilmesi için önerilen tedarikçi bilgileri listelenmiştir.
                </p>

                {criticalProducts.length === 0 ? (
                  <p style={{color:'#10b981', fontWeight:'bold', textAlign:'center', padding:'1.5rem'}}>Stok durumu tüm ürünler için güvenli seviyededir. Kritik ürün bulunmamaktadır.</p>
                ) : (
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%', borderCollapse:'collapse', textAlign:'left'}}>
                      <thead>
                        <tr style={{borderBottom:'2px solid #cbd5e1', color:'#475569'}}>
                          <th style={{padding:'0.75rem'}}>Ürün Adı</th>
                          <th style={{padding:'0.75rem'}}>Mevcut Stok</th>
                          <th style={{padding:'0.75rem'}}>Önerilen Tedarikçi</th>
                          <th style={{padding:'0.75rem'}}>Tedarikçi Telefon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criticalProducts.map((p, index) => (
                          <tr key={index} style={{borderBottom:'1px solid #e2e8f0'}}>
                            <td style={{padding:'0.75rem', fontWeight:'500'}}>{p.productName}</td>
                            <td style={{padding:'0.75rem', color:'#ef4444', fontWeight:'bold'}}>{p.stock}</td>
                            <td style={{padding:'0.75rem'}}>{p.supplier}</td>
                            <td style={{padding:'0.75rem', fontFamily:'monospace'}}>{p.supplierPhone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- SUPPLIERS TAB --- */}
          {activeTab === 'suppliers' && (
            <div>
              <h2 style={{marginBottom:'2rem'}}>Tedarikçi Yönetimi</h2>
              
              <div style={{background:'#f8fafc', padding:'1.5rem', borderRadius:'0.5rem', marginBottom:'2rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>{supId ? 'Tedarikçiyi Düzenle' : 'Yeni Tedarikçi Ekle'}</h3>
                    {supId && <button className="btn btn-outline" style={{padding:'0.5rem'}} onClick={resetSupplierForm}>İptal (Yeni Ekle'ye Dön)</button>}
                </div>
                <form onSubmit={handleSaveSupplier} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1rem'}}>
                  <input type="text" className="input-field" placeholder="Tedarikçi Adı (Örn: Teknoloji A.Ş.)" value={supName} onChange={e=>setSupName(e.target.value)} required />
                  <input type="text" className="input-field" placeholder="Telefon Numarası" value={supPhone} onChange={e=>setSupPhone(e.target.value)} required />
                  
                  <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}}>
                      {supId ? <><Edit size={20}/> Güncelle</> : <><Plus size={20}/> Tedarikçi Ekle</>}
                  </button>
                </form>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {suppliers.map(s => (
                  <div key={s.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', border:'1px solid #e2e8f0', borderRadius:'0.5rem'}}>
                    <div>
                      <strong>{s.name}</strong> <br/>
                      <span style={{fontSize:'0.9rem', color:'gray'}}>📞 {s.phone}</span>
                    </div>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                        <button className="btn" style={{background:'#3b82f6', color:'white', padding:'0.5rem 1rem'}} onClick={() => handleEditSupplierClick(s)}>
                        <Edit size={16}/> Düzenle
                        </button>
                        <button className="btn" style={{background:'#ef4444', color:'white', padding:'0.5rem 1rem'}} onClick={() => handleDeleteSupplier(s.id)}>
                        <Trash2 size={16}/> Sil
                        </button>
                    </div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <p style={{textAlign:'center', color:'var(--text-muted)'}}>Henüz tedarikçi eklenmemiş.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
