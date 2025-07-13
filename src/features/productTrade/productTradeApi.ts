import api from '@/api';

export type AlisSatis = 'ALIS' | 'SATIS';
export type ParaTipi = 'TURKLIRASI' | 'DOLAR' | 'EURO';
export type OdemeTip = 'CEK' | 'NAKIT' | 'KREDI_KARTI';

export interface ProductInOrOutDto {
  id: number;
  productId: number;
  productName: string;
  productCode?: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  kilograms: number;
  price: number;
  alisSatis: AlisSatis;
  paraTipi: ParaTipi;
  odemeTip: OdemeTip;
  active: boolean;
  dovizKuru: number;
}

export const createProductMovement = (data: Omit<ProductInOrOutDto, 'id'>) =>
  api.post<ProductInOrOutDto>('/product-movements', data);

export const getProductMovementById = (id: number) =>
  api.get<ProductInOrOutDto>(`/product-movements/${id}`);

export const getAllProductMovements = () =>
  api.get<ProductInOrOutDto[]>('/product-movements');

export const updateProductMovement = (id: number, data: Omit<ProductInOrOutDto, 'id'>) =>
  api.put<ProductInOrOutDto>(`/product-movements/${id}`, data);

export const deleteProductMovement = (id: number) =>
  api.delete<void>(`/product-movements/${id}`);

export const getProductMovementsByCustomerId = (customerId: number) =>
  api.get<ProductInOrOutDto[]>(`/product-movements/findByCustomerId/${customerId}`); 