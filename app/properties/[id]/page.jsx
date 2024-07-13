'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';

const PropertyPage = () => {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div>
      <div className='text-3xl'>PropertyPage</div>
    </div>
  );
};

export default PropertyPage;
