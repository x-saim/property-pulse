'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchProperty } from '@/utils/requests';
import PropertyHeaderImage from '@/components/PropertyHeaderImage';
import PropertyDetails from '@/components/PropertyDetails';
import { FaArrowLeft } from 'react-icons/fa';
import PropertySidebar from '@/components/PropertySidebar';
import Spinner from '@/components/Spinner';
import PropertyImages from '@/components/PropertyImages';

/**
 * React functional component for displaying a property page.
 * Fetches property data based on the provided ID and handles loading and error states.
 * Displays the property information and header image if available.
 */
const PropertyPage = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      const property = await fetchProperty(id);
      setProperty(property);
      setLoading(false);
    };

    fetchPropertyData();
  }, [id]);

  if (!property && !loading) {
    return (
      <h1 className='text-center text-2xl font-bold mt-10'>
        Property Not Found.
      </h1>
    );
  }

  return (
    <>
      {loading && <Spinner loading={loading} />}

      {!loading && property && (
        <>
          {/* Header Image */}
          <PropertyHeaderImage image={property.images[0]} />
          <section>
            <div className='container m-auto py-6 px-6'>
              <Link
                href='/properties'
                className='text-blue-500 hover:text-blue-600 flex items-center'
              >
                <FaArrowLeft className='mr-2' />
                Back to Properties
              </Link>
            </div>
          </section>
          <section className='bg-blue-50'>
            <div className='container m-auto py-10 px-6'>
              <div className='grid grid-cols-1 md:grid-cols-70/30 w-full gap-6'>
                {/* <!-- Main Section --> */}
                <PropertyDetails property={property} />

                {/* <!-- Sidebar --> */}
                <PropertySidebar property={property} />
              </div>
            </div>
          </section>
          <PropertyImages images={property.images} />
        </>
      )}
    </>
  );
};

export default PropertyPage;
s;
