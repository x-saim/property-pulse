'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import PropertyEditForm from '@/components/PropertyEditForm';
import Spinner from '@/components/Spinner';

const EditPropertyPage = () => {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const { id } = useParams();

  useEffect(() => {
    const verifyOwner = async () => {
      if (status !== 'authenticated') return;

      try {
        const res = await fetch(`/api/properties/${id}`);
        const property = await res.json();

        if (property.owner.toString() !== session.user.id) {
          toast.error('Unauthorized.');
          return;
        }

        setVerified(true);
      } catch (error) {
        console.error('Failed to verify property ownership:', error);
        toast.error('An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    verifyOwner();
  }, [session, status, id]);

  if (loading) return <Spinner />;

  return (
    <section className='bg-blue-50'>
      <div className='container m-auto max-w-2xl py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
          {verified ? (
            <PropertyEditForm />
          ) : (
            <p>You are not authorized to edit this property.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EditPropertyPage;
