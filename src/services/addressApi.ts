import { apiClient } from './api';

export interface Address {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: 'billing' | 'shipping';
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
  address_type: 'billing' | 'shipping';
}

export type UpdateAddressData = Partial<CreateAddressData>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const addressApi = {
  // Get all user addresses
  getUserAddresses: async (): Promise<Address[]> => {
    try {
      const response = await apiClient.request<ApiResponse<Address[]>>('/users/addresses');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      throw error;
    }
  },

  // Get specific address by ID
  getAddress: async (addressId: string): Promise<Address> => {
    try {
      const response = await apiClient.request<ApiResponse<Address>>(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch address:', error);
      throw error;
    }
  },

  // Create new address
  createAddress: async (addressData: CreateAddressData): Promise<Address> => {
    try {
      const response = await apiClient.request<ApiResponse<Address>>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  },

  // Update existing address
  updateAddress: async (addressId: string, addressData: UpdateAddressData): Promise<Address> => {
    try {
      const response = await apiClient.request<ApiResponse<Address>>(`/users/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId: string): Promise<void> => {
    try {
      await apiClient.request<ApiResponse<{ deleted: boolean }>>(`/users/addresses/${addressId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  },
};
