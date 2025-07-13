import api from '@/api';

export interface ProductDto {
  id: number;
  productName: string;
  productDescription: string;
  totalAmount: number;
  active: boolean;
  createdDate: string;
  updateDate: string;
}

export const createProduct = (product: Omit<ProductDto, 'id'>) =>
  api.post<ProductDto>('/products', product);

export const getProductById = (id: number) =>
  api.get<ProductDto>(`/products/${id}`);

export const getAllProducts = () =>
  api.get<ProductDto[]>('/products');

export const getProductsByStatus = (active: boolean) =>
  api.get<ProductDto[]>(`/products/by-status?active=${active}`);

export const updateProduct = (id: number, product: Omit<ProductDto, 'id'>) =>
  api.put<ProductDto>(`/products/${id}`, product);

export const deleteProduct = (id: number) =>
  api.delete<void>(`/products/${id}`); 