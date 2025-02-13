import React from 'react';
import { fetchProperties } from '@/utils/requests';
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';

const HomeProperties = async () => {
  const data = await fetchProperties();

  // After sorting randomly, select the first 3 elements from the randomly sorted array.
  const recentProperties = data.properties
    .sort(() => Math.random() - Math.random())
    .slice(0, 3);

  return (
    <>
      {' '}
      <section className='px-4 py-6'>
        <div className='container-xl lg:container m-auto'>
          <h2 className='text-3xl font-bold text-blue-500 mb-6 text-center'>
            Recent Properties
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {recentProperties === 0 ? (
              <p>No properties found.</p>
            ) : (
              recentProperties.map((propertyInfo) => (
                <PropertyCard
                  key={propertyInfo._id}
                  propertyInfo={propertyInfo}
                />
              ))
            )}
          </div>
        </div>
      </section>
      <section className='m-auto max-w-lg my-10 px-6'>
        <Link
          href='/properties'
          className='block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700'
        >
          View All Properties
        </Link>
      </section>
    </>
  );
};

export default HomeProperties;
