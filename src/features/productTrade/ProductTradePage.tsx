import React, { useEffect, useState } from 'react';
import Sidebar from '../../assets/Sidebar';
import { Button } from '@/components/ui/button';
import { getAllProductMovements, createProductMovement, updateProductMovement } from './productTradeApi';
import type { ProductInOrOutDto, AlisSatis, ParaTipi, OdemeTip } from './productTradeApi';
import { getAllProducts } from '../products/productsApi';
import type { ProductDto } from '../products/productsApi';
import toastr from 'toastr';

const initialForm = {
  productId: 0,
  productName: '',
  kilograms: 0,
  price: 0,
  alisSatis: 'ALIS' as AlisSatis,
  paraTipi: 'TURKLIRASI' as ParaTipi,
  odemeTip: 'CEK' as OdemeTip,
  active: true,
  dovizKuru: 1,
};

const ProductTradePage: React.FC = () => {
  const [movements, setMovements] = useState<ProductInOrOutDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Filtre state'leri
  const [filters, setFilters] = useState({
    productName: '',
    alisSatis: '',
    paraTipi: '',
    odemeTip: ''
  });

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  // Debug form state changes
  useEffect(() => {
    console.log('Form state changed:', form);
  }, [form]);

  const fetchMovements = () => {
    setLoading(true);
    getAllProductMovements()
      .then((res) => {
        console.log('API Response:', res.data);
        setMovements(res.data);
      })
      .catch(() => setError('İşlemler alınamadı'))
      .finally(() => setLoading(false));
  };

  const fetchProducts = () => {
    getAllProducts()
      .then((res) => setProducts(res.data))
      .catch(() => console.error('Ürünler alınamadı'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log('Form input change:', { name, value, type });
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      };
      console.log('Updated form state:', newForm);
      return newForm;
    });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = Number(e.target.value);
    const selectedProduct = products.find(p => p.id === productId);
    setForm(prev => ({
      ...prev,
      productId,
      productName: selectedProduct?.productName || '',
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!form.productId || form.productId === 0) {
      errors.push('Ürün seçimi zorunludur');
    }
    
    if (!form.alisSatis) {
      errors.push('İşlem türü seçimi zorunludur');
    }
    
    if (!form.kilograms || form.kilograms <= 0) {
      errors.push('Miktar (kg) 0\'dan büyük olmalıdır');
    }
    
    if (!form.price || form.price <= 0) {
      errors.push('Fiyat 0\'dan büyük olmalıdır');
    }
    
    if (!form.paraTipi) {
      errors.push('Para tipi seçimi zorunludur');
    }
    
    if (!form.odemeTip) {
      errors.push('Ödeme tipi seçimi zorunludur');
    }
    
    if (!form.dovizKuru || form.dovizKuru <= 0) {
      errors.push('Döviz kuru 0\'dan büyük olmalıdır');
    }
    
    return errors;
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      productName: '',
      alisSatis: '',
      paraTipi: '',
      odemeTip: ''
    });
  };

  const filteredMovements = movements.filter(movement => {
    // Ürün adı filtresi
    if (filters.productName && !movement.productName.toLowerCase().includes(filters.productName.toLowerCase())) {
      return false;
    }
    
    // İşlem türü filtresi
    if (filters.alisSatis && movement.alisSatis !== filters.alisSatis) {
      return false;
    }
    
    // Para tipi filtresi
    if (filters.paraTipi && movement.paraTipi !== filters.paraTipi) {
      return false;
    }
    
    // Ödeme tipi filtresi
    if (filters.odemeTip && movement.odemeTip !== filters.odemeTip) {
      return false;
    }
    
    return true;
  });

  const handleUpdate = (movement: ProductInOrOutDto) => {
    console.log('Updating movement:', movement);
    console.log('Current odemeTip:', movement.odemeTip);
    setForm({
      productId: movement.productId,
      productName: movement.productName,
      kilograms: movement.kilograms,
      price: movement.price,
      alisSatis: movement.alisSatis,
      paraTipi: movement.paraTipi,
      odemeTip: movement.odemeTip,
      active: movement.active,
      dovizKuru: movement.dovizKuru,
    });
    setUpdateId(movement.id);
    setIsUpdateMode(true);
    setShowModal(true);
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data before validation:', form);
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      setFormError(validationErrors.join(', '));
      return;
    }
    
    setSaving(true);
    setFormError(null);
    try {
      if (isUpdateMode && updateId) {
        console.log('Updating with data:', form);
        console.log('Update ID:', updateId);
        await updateProductMovement(updateId, form);
        toastr.success('İşlem başarıyla güncellendi');
      } else {
        console.log('Creating with data:', form);
        await createProductMovement(form);
        toastr.success('İşlem başarıyla kaydedildi');
      }
      
      setShowModal(false);
      console.log('Resetting form to initial state after successful save');
      setForm(initialForm);
      setIsUpdateMode(false);
      setUpdateId(null);
      fetchMovements();
    } catch (err) {
      console.error('Error during save/update:', err);
      setFormError(isUpdateMode ? 'Güncelleme başarısız!' : 'Kayıt başarısız!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 32, background: '#f4f6fb' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Ürün Alış-Satış</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button 
            onClick={() => {
              console.log('Opening modal for new item, resetting form to:', initialForm);
              setShowModal(true);
              setForm(initialForm);
              setFormError(null);
              setIsUpdateMode(false);
              setUpdateId(null);
            }} 
            style={{ background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 24, boxShadow: '0 2px 8px #22c55e33', padding: '12px 28px', fontWeight: 600, fontSize: 16, transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}
            onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
            onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5V17M5 11H17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Yeni İşlem Ekle
          </Button>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001' }}>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <>
              {/* Filtre Alanları */}
              <div style={{ marginBottom: 20, padding: '20px', background: '#e9ecef', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#495057' }}>Filtreler</h3>
                  <Button 
                    onClick={clearFilters}
                    style={{ 
                      background: '#6c757d', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '6px', 
                      padding: '8px 16px', 
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {/* Ürün Adı Filtresi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#495057' }}>Ürün Adı</label>
                    <input
                      type="text"
                      placeholder="Ürün adı ara..."
                      value={filters.productName}
                      onChange={(e) => handleFilterChange('productName', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  
                  {/* İşlem Türü Filtresi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#495057' }}>İşlem Türü</label>
                    <select
                      value={filters.alisSatis}
                      onChange={(e) => handleFilterChange('alisSatis', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Tümü</option>
                      <option value="ALIS">Alış</option>
                      <option value="SATIS">Satış</option>
                    </select>
                  </div>
                  
                  {/* Para Tipi Filtresi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#495057' }}>Para Tipi</label>
                    <select
                      value={filters.paraTipi}
                      onChange={(e) => handleFilterChange('paraTipi', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Tümü</option>
                      <option value="TURKLIRASI">TürkLirası</option>
                      <option value="DOLAR">DOLAR</option>
                      <option value="EURO">EURO</option>
                    </select>
                  </div>
                  
                  {/* Ödeme Tipi Filtresi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#495057' }}>Ödeme Tipi</label>
                    <select
                      value={filters.odemeTip}
                      onChange={(e) => handleFilterChange('odemeTip', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Tümü</option>
                      <option value="CEK">Çek</option>
                      <option value="NAKIT">Nakit</option>
                      <option value="KREDI_KARTI">Kredi Kartı</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 180 }}>Ürün</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 100 }}>Tür</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 120 }}>Miktar (kg)</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 120 }}>Fiyat</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 100 }}>Para Tipi</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 100 }}>Döviz Kuru</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', width: 120 }}>Ödeme Tipi</th>
                    <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #eee', width: 120 }}>İşlemler</th>
                  </tr>
                </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr key={m.id} style={{ 
                    backgroundColor: m.alisSatis === 'ALIS' ? '#fecaca' : m.alisSatis === 'SATIS' ? '#bfdbfe' : 'transparent'
                  }}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 180 }}>{m.productName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 100 }}>
                      {m.alisSatis === 'ALIS' ? 'Alış' : 
                       m.alisSatis === 'SATIS' ? 'Satış' : 
                       m.alisSatis || 'N/A'}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 120 }}>{m.kilograms}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 120 }}>{m.price}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 100 }}>
                      {m.paraTipi === 'TURKLIRASI' ? 'TürkLirası' : 
                       m.paraTipi === 'DOLAR' ? 'DOLAR' : 
                       m.paraTipi === 'EURO' ? 'EURO' : 
                       m.paraTipi || 'N/A'}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 100 }}>{m.dovizKuru}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 120 }}>
                      {m.odemeTip === 'CEK' ? 'Çek' : 
                       m.odemeTip === 'NAKIT' ? 'Nakit' : 
                       m.odemeTip === 'KREDI_KARTI' ? 'Kredi Kartı' : 
                       m.odemeTip || 'N/A'}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb', width: 120, textAlign: 'right' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdate(m)}
                        style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 20, boxShadow: '0 2px 8px #f59e0b33', padding: '8px 20px', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#d97706')}
                        onMouseOut={e => (e.currentTarget.style.background = '#f59e0b')}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Güncelle
                      </Button>
                    </td>
                  </tr>
                ))}
                              </tbody>
              </table>
            </>
          )}
        </div>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
              <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>{isUpdateMode ? 'İşlem Güncelle' : 'Yeni İşlem'}</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="productId" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ürün</label>
                  <select id="productId" name="productId" value={form.productId} onChange={handleProductChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="">Ürün seçin</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.productName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="alisSatis" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>İşlem Türü</label>
                  <select id="alisSatis" name="alisSatis" value={form.alisSatis} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} disabled>
                    <option value="ALIS">Alış</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="kilograms" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Miktar (kg)</label>
                  <input id="kilograms" name="kilograms" type="number" value={form.kilograms} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="price" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Fiyat(Kilogram Fiyatı)</label>
                  <input id="price" name="price" type="number" value={form.price} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="paraTipi" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Para Tipi</label>
                  <select id="paraTipi" name="paraTipi" value={form.paraTipi} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="TURKLIRASI">TürkLirası</option>
                    <option value="DOLAR">DOLAR</option>
                    <option value="EURO">EURO</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="dovizKuru" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Döviz Kuru(TL İşlemler İçin Kuru 1 olarak giriniz)</label>
                  <input id="dovizKuru" name="dovizKuru" type="number" step="0.01" value={form.dovizKuru} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="odemeTip" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ödeme Tipi</label>
                  <select id="odemeTip" name="odemeTip" value={form.odemeTip} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="CEK">Çek</option>
                    <option value="NAKIT">Nakit</option>
                    <option value="KREDI_KARTI">Kredi Kartı</option>
                  </select>
                </div>
                {formError && (
                  <div style={{ 
                    color: '#dc2626', 
                    marginBottom: 16, 
                    padding: '12px 16px', 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Lütfen Yukarıdaki hataları düzeltin:</div>
                    {formError.split(', ').map((error, index) => (
                      <div key={index} style={{ marginLeft: '8px' }}>• {error}</div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)} 
                    disabled={saving}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 20, boxShadow: '0 2px 8px #ef444433', padding: '10px 28px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#dc2626')}
                    onMouseOut={e => (e.currentTarget.style.background = '#ef4444')}
                  >
                    Vazgeç
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 20, boxShadow: '0 2px 8px #22c55e33', padding: '10px 28px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
                    onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
                  >
                    {saving ? (isUpdateMode ? 'Güncelleniyor...' : 'Kaydediliyor...') : (isUpdateMode ? 'Güncelle' : 'Kaydet')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductTradePage; 