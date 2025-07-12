import React, { useEffect, useState } from 'react';
import Sidebar from '../../assets/Sidebar';
import { getAllCustomers, createCustomer } from './customersApi';
import type { CustomerDto } from './customersApi';
import { Button } from '@/components/ui/button';
import toastr from 'toastr';

const initialForm: Omit<CustomerDto, 'id'> = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  comment: '',
  companyName: '',
  active: true,
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<CustomerDto, 'id'>>(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    getAllCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => setError('Müşteriler alınamadı'))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createCustomer(form);
      toastr.success('Müşteri başarıyla kaydedildi');
      setShowModal(false);
      setForm(initialForm);
      fetchCustomers();
    } catch (err) {
      setFormError('Kayıt başarısız!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 32, background: '#f4f6fb' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Müşteriler</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button 
            onClick={() => setShowModal(true)} 
            style={{ 
              background: '#22c55e', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              borderRadius: 24, 
              boxShadow: '0 2px 8px #22c55e33',
              padding: '12px 28px',
              fontWeight: 600,
              fontSize: 16,
              transition: 'background 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
            onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5V17M5 11H17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Yeni Müşteri Ekle
          </Button>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001' }}>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Ad</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Soyad</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Firma</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Telefon</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{customer.firstName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{customer.lastName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{customer.companyName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>{customer.phoneNumber}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f4f6fb' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => alert(`Detay: ${customer.id}`)}
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 20,
                          boxShadow: '0 2px 8px #2563eb33',
                          padding: '8px 20px',
                          fontWeight: 600,
                          fontSize: 15,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#1d4ed8')}
                        onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="10" cy="10" r="3" fill="currentColor"/>
                        </svg>
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
              <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>Yeni Müşteri</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="firstName" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Ad</label>
                  <input id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="lastName" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Soyad</label>
                  <input id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="companyName" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Firma</label>
                  <input id="companyName" name="companyName" value={form.companyName} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="phoneNumber" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Telefon</label>
                  <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="comment" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Açıklama</label>
                  <textarea id="comment" name="comment" value={form.comment} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)} 
                    disabled={saving}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 20,
                      boxShadow: '0 2px 8px #ef444433',
                      padding: '10px 28px',
                      fontWeight: 600,
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#dc2626')}
                    onMouseOut={e => (e.currentTarget.style.background = '#ef4444')}
                  >
                    Vazgeç
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    style={{
                      background: '#22c55e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 20,
                      boxShadow: '0 2px 8px #22c55e33',
                      padding: '10px 28px',
                      fontWeight: 600,
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
                    onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
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

export default CustomersPage; 