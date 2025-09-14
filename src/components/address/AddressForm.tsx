'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAddressData, Address } from '@/services/addressApi';

const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  is_default: z.boolean().optional().default(false),
  address_type: z.enum(['billing', 'shipping']),
});

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: CreateAddressData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultAddressType?: 'shipping' | 'billing';
}

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NG', label: 'Nigeria' },
];

export function AddressForm({ address, onSubmit, onCancel, isLoading, defaultAddressType = 'shipping' }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address ? {
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
      address_type: address.address_type,
    } : {
      first_name: '',
      last_name: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      phone: '',
      is_default: false,
      address_type: defaultAddressType,
    },
  });

  const watchedCountry = watch('country');
  const watchedAddressType = watch('address_type');
  const watchedIsDefault = watch('is_default');

  const handleFormSubmit = async (data: CreateAddressData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            className={errors.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company (Optional)</Label>
        <Input
          id="company"
          {...register('company')}
        />
      </div>

      <div>
        <Label htmlFor="address1">Address Line 1 *</Label>
        <Input
          id="address1"
          {...register('address1')}
          className={errors.address1 ? 'border-red-500' : ''}
        />
        {errors.address1 && (
          <p className="text-sm text-red-500 mt-1">{errors.address1.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address2">Address Line 2 (Optional)</Label>
        <Input
          id="address2"
          {...register('address2')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city')}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            {...register('state')}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zip_code">ZIP Code *</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            className={errors.zip_code ? 'border-red-500' : ''}
          />
          {errors.zip_code && (
            <p className="text-sm text-red-500 mt-1">{errors.zip_code.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select
            value={watchedCountry}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address_type">Address Type *</Label>
          <Select
            value={watchedAddressType}
            onValueChange={(value: 'billing' | 'shipping') => setValue('address_type', value)}
          >
            <SelectTrigger className={errors.address_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
          {errors.address_type && (
            <p className="text-sm text-red-500 mt-1">{errors.address_type.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Checkbox
            id="is_default"
            checked={watchedIsDefault}
            onCheckedChange={(checked) => setValue('is_default', !!checked)}
          />
          <Label htmlFor="is_default" className="text-sm">
            Set as default address
          </Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
