import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomerById } from './customersApi';
import type { CustomerDto } from './customersApi';
import { getProductMovementsByCustomerId, createProductMovement } from '../productTrade/productTradeApi';
import type { ProductInOrOutDto, AlisSatis, ParaTipi, OdemeTip } from '../productTrade/productTradeApi';
import Sidebar from '../../assets/Sidebar';
import { getAllProducts } from '../products/productsApi';
import type { ProductDto } from '../products/productsApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/ToastProvider';

// Örnek datatable verisi
const exampleData = [
  { id: 1, tarih: '2024-06-01', işlem: 'Sipariş', tutar: '1500₺' },
  { id: 2, tarih: '2024-06-03', işlem: 'Ödeme', tutar: '1500₺' },
  { id: 3, tarih: '2024-06-05', işlem: 'Sipariş', tutar: '2000₺' },
];

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<ProductInOrOutDto[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    productId: 0,
    productName: '',
    kilograms: 0,
    price: 0,
    alisSatis: 'SATIS' as AlisSatis,
    paraTipi: 'TURKLIRASI' as ParaTipi,
    odemeTip: 'CEK' as OdemeTip,
    active: true,
    dovizKuru: 1,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomerById(Number(id))
      .then(res => setCustomer(res.data))
      .catch(() => setError('Müşteri bulunamadı'))
      .finally(() => setLoading(false));
    setMovementsLoading(true);
    getProductMovementsByCustomerId(Number(id))
      .then(res => setMovements(res.data))
      .catch(() => setMovementsError('İşlem geçmişi alınamadı'))
      .finally(() => setMovementsLoading(false));
    getAllProducts()
      .then(res => setProducts(res.data))
      .catch(() => {});
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
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
    if (!form.productId || form.productId === 0) errors.push('Ürün seçimi zorunludur');
    if (!form.alisSatis) errors.push('İşlem türü seçimi zorunludur');
    if (!form.kilograms || form.kilograms <= 0) errors.push('Miktar (kg) 0\'dan büyük olmalıdır');
    if (!form.price || form.price <= 0) errors.push('Fiyat 0\'dan büyük olmalıdır');
    if (!form.paraTipi) errors.push('Para tipi seçimi zorunludur');
    if (!form.odemeTip) errors.push('Ödeme tipi seçimi zorunludur');
    if (!form.dovizKuru || form.dovizKuru <= 0) errors.push('Döviz kuru 0\'dan büyük olmalıdır');
    return errors;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFormError(validationErrors.join(', '));
      toast.showToast(validationErrors.join(', '), 'error');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await createProductMovement({ ...form, customerId: Number(id) });
      if (res.data.success) {
        toast.showToast(res.data.message, 'success');
        setShowModal(false);
        setForm({
          productId: 0,
          productName: '',
          kilograms: 0,
          price: 0,
          alisSatis: 'SATIS' as AlisSatis,
          paraTipi: 'TURKLIRASI' as ParaTipi,
          odemeTip: 'CEK' as OdemeTip,
          active: true,
          dovizKuru: 1,
        });
        setMovementsLoading(true);
        getProductMovementsByCustomerId(Number(id))
          .then(res => setMovements(res.data))
          .catch(() => setMovementsError('İşlem geçmişi alınamadı'))
          .finally(() => setMovementsLoading(false));
      } else {
        toast.showToast(res.data.message, 'error');
        setFormError(res.data.message);
      }
    } catch (err) {
      toast.showToast('Kayıt başarısız!', 'error');
      setFormError('Kayıt başarısız!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 32, background: '#f4f6fb' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Müşteri Detayı</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32, alignItems: 'start' }}>
          {/* Soldan 8 kolon: datatable */}
          <div style={{ gridColumn: '1 / span 8', background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 16px #0002', minWidth: 400, minHeight: 340 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>İşlem Geçmişi</h2>
              <Button onClick={() => setShowModal(true)} style={{ background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 20, padding: '10px 24px', boxShadow: '0 2px 8px #22c55e33', border: 'none', cursor: 'pointer' }}>Yeni İşlem Ekle</Button>
            </div>
            {showModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
                  <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Yeni İşlem</h2>
                  <form onSubmit={handleCreate}>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ürün</label>
                      <select name="productId" value={form.productId} onChange={handleProductChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Ürün seçin</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.productName}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>İşlem Türü</label>
                      <select name="alisSatis" value={form.alisSatis} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} disabled>
                        <option value="SATIS">Satış</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Miktar (kg)</label>
                      <input name="kilograms" type="number" value={form.kilograms} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Fiyat</label>
                      <input name="price" type="number" value={form.price} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Para Tipi</label>
                      <select name="paraTipi" value={form.paraTipi} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="TURKLIRASI">TürkLirası</option>
                        <option value="DOLAR">DOLAR</option>
                        <option value="EURO">EURO</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Döviz Kuru</label>
                      <input name="dovizKuru" type="number" step="0.01" value={form.dovizKuru} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ödeme Tipi</label>
                      <select name="odemeTip" value={form.odemeTip} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="CEK">Çek</option>
                        <option value="NAKIT">Nakit</option>
                        <option value="KREDI_KARTI">Kredi Kartı</option>
                        <option value="BORC">Borç</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Müşteri</label>
                      <input value={customer?.firstName + ' ' + customer?.lastName} disabled style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: '#f4f6fb' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={saving} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 20, boxShadow: '0 2px 8px #ef444433', padding: '10px 28px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'background 0.2s' }}>Vazgeç</Button>
                      <Button type="submit" disabled={saving} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 20, boxShadow: '0 2px 8px #22c55e33', padding: '10px 28px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'background 0.2s' }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {movementsLoading ? (
              <p>Yükleniyor...</p>
            ) : movementsError ? (
              <p style={{ color: 'red' }}>{movementsError}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>İşlem</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Ürün</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Miktar (kg)</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Fiyat</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Para Tipi</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Ödeme Tipi</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(row => (
                    <tr key={row.id}>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{row.alisSatis === 'ALIS' ? 'Alış' : row.alisSatis === 'SATIS' ? 'Satış' : '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{row.productName}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{row.kilograms}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{row.price}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{row.paraTipi}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{
                        row.odemeTip === 'CEK' ? 'Çek' :
                        row.odemeTip === 'NAKIT' ? 'Nakit' :
                        row.odemeTip === 'KREDI_KARTI' ? 'Kredi Kartı' :
                        row.odemeTip === 'BORC' ? 'Borç' :
                        row.odemeTip || 'N/A'
                      }</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Sağdan 4 kolon: müşteri detayları */}
          <div style={{ gridColumn: '9 / span 4', background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 16px #0002', minWidth: 300, minHeight: 340 }}>
            {loading ? (
              <p>Yükleniyor...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : customer ? (
              <>
                <p><b>Ad:</b> {customer.firstName}</p>
                <p><b>Soyad:</b> {customer.lastName}</p>
                <p><b>Firma:</b> {customer.companyName}</p>
                <p><b>Telefon:</b> {customer.phoneNumber}</p>
                <p><b>Açıklama:</b> {customer.comment}</p>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDetailPage; 