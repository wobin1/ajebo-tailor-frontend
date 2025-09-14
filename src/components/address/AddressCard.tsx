'use client';

import React from 'react';
import { MapPin, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/services/addressApi';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const formatAddress = (addr: Address) => {
    const parts = [
      addr.address1,
      addr.address2,
      addr.city,
      addr.state,
      addr.zip_code,
      addr.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">
                {address.first_name} {address.last_name}
              </p>
              {address.company && (
                <p className="text-sm text-gray-600">{address.company}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {address.is_default && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {address.address_type}
            </Badge>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            {formatAddress(address)}
          </p>
          {address.phone && (
            <p className="text-sm text-gray-600 mt-1">
              Phone: {address.phone}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className="text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            {!address.is_default && onSetDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id)}
                className="text-xs"
              >
                <Star className="h-3 w-3 mr-1" />
                Set Default
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(address.id)}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
