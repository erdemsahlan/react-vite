import api from '@/api';

export interface CustomerDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  comment: string;
  companyName: string;
  active: boolean;
}

export const createCustomer = (customer: Omit<CustomerDto, 'id'>) =>
  api.post<CustomerDto>('/customers', customer);

export const getCustomerById = (id: number) =>
  api.get<CustomerDto>(`/customers/${id}`);

export const getAllCustomers = () =>
  api.get<CustomerDto[]>('/customers/getAll');

export const getCustomersByStatus = (active: boolean) =>
  api.get<CustomerDto[]>(`/customers/by-status?active=${active}`);

export const updateCustomer = (id: number, customer: Omit<CustomerDto, 'id'>) =>
  api.put<CustomerDto>(`/customers/${id}`, customer);

export const deleteCustomer = (id: number) =>
  api.delete<void>(`/customers/${id}`); 