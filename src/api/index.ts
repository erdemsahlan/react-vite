import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toastr from 'toastr';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    toastr.error('İstek gönderilirken hata oluştu.');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          toastr.error('Geçersiz istek. Lütfen bilgilerinizi kontrol edin.', 'Hata 400');
          break;
        case 401:
          toastr.warning('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.', 'Yetkisiz (401)');
          localStorage.removeItem('token');
          window.location.reload();
          break;
        case 403:
          toastr.warning('Bu işlem için yetkiniz bulunmuyor. Lütfen tekrar giriş yapın.', 'Yetkisiz (403)');
          localStorage.removeItem('token');
          window.location.reload();
          break;
        case 404:
          toastr.error('İstenilen kaynak bulunamadı.', 'Bulunamadı (404)');
          break;
        case 500:
          toastr.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.', 'Sunucu Hatası (500)');
          break;
        default:
          toastr.error('Bilinmeyen bir hata oluştu.', `Hata ${error.response.status}`);
      }
    } else {
      toastr.error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
    }
    return Promise.reject(error);
  }
);

export default api; 