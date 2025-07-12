import React, { useState } from 'react';
import { login } from './loginApi';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log(username, password);
    try {
      await login(username, password);
      window.location.href = '/';
    } catch (err) {
      setError('Giriş başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ minWidth: 320, padding: 32, border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Giriş Yap</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#646cff', color: '#fff', border: 'none', fontWeight: 600 }}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
};

export default LoginPage; 