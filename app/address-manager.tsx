import React, { useState } from 'react';
import AddressManager from '@/components/AddressManager';
import { mockAddresses } from '@/data/mockData';
import { Address } from '@/types';
import { useRouter } from 'expo-router';

export default function AddressManagerScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  return (
    <AddressManager
      addresses={addresses}
      onAddressesChange={setAddresses}
      onClose={() => router.back()}
    />
  );
} 