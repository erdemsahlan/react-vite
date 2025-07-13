import api from '../../api';

export async function login(username: string, password: string) {
  const response = await api.post('/auth/login', { username, password });
  const token = response.data?.token;
  if (token) {
    localStorage.setItem('token', token);
    return token;
  } else {
    throw new Error('Token alınamadı!');
  }
}

export function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
  }
  return token;
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
} 