'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddressForm } from './AddressForm';
import { CreateAddressData, Address, addressApi } from '@/services/addressApi';
import { toast } from 'sonner';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address: Address) => void;
  address?: Address;
  defaultAddressType?: 'shipping' | 'billing';
  isLoading?: boolean;
}

export function AddressModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  address, 
  defaultAddressType = 'shipping',
  isLoading 
}: AddressModalProps) {
  const handleSubmit = async (data: CreateAddressData) => {
    try {
      // Set default address type if not specified
      if (!data.address_type) {
        data.address_type = defaultAddressType;
      }
      
      let result: Address;
      if (address) {
        // Update existing address
        result = await addressApi.updateAddress(address.id, data);
        toast.success('Address updated successfully');
      } else {
        // Create new address
        result = await addressApi.createAddress(data);
        toast.success('Address added successfully');
      }
      
      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {address ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>
        <AddressForm
          address={address}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          defaultAddressType={defaultAddressType}
        />
      </DialogContent>
    </Dialog>
  );
}
