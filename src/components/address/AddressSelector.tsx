'use client';

import React, { useState } from 'react';
import { Plus, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/services/addressApi';
import { AddressModal } from './AddressModal';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId?: string;
  onAddressSelect: (addressId: string) => void;
  onAddressesChange: () => void;
  title: string;
  addressType?: 'shipping' | 'billing';
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onAddressesChange,
  title,
  addressType = 'shipping'
}: AddressSelectorProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Filter addresses by type if specified
  const filteredAddresses = addresses.filter(addr => 
    !addressType || addr.address_type === addressType
  );

  // If no addresses match the type, show all addresses
  const displayAddresses = filteredAddresses.length > 0 ? filteredAddresses : addresses;

  const handleAddAddress = async (address: Address) => {
    try {
      // Address creation is handled in AddressModal
      setShowAddressModal(false);
      onAddressesChange();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddressModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </Button>
      </div>

      <div className="space-y-3">
        {displayAddresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 mb-4">No addresses found</p>
              <Button
                variant="outline"
                onClick={() => setShowAddressModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          displayAddresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium text-gray-900">
                        {address.first_name} {address.last_name}
                      </p>
                      {address.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          address.address_type === 'shipping' 
                            ? 'text-blue-600 border-blue-200' 
                            : 'text-green-600 border-green-200'
                        }`}
                      >
                        {address.address_type}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {address.company && <p>{address.company}</p>}
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.state} {address.zip_code}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>
                  </div>
                  
                  {selectedAddressId === address.id && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showAddressModal && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSuccess={handleAddAddress}
          defaultAddressType={addressType}
        />
      )}
    </div>
  );
}
