'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProperty } from '@/utils/requests';
import { NextResponse } from 'next/server';

/**
 * Fetches property data based on the provided id and updates the state accordingly.
 * If the id is falsy, no action is taken.
 * Handles loading state, error state, and sets the property state upon successful data retrieval.
 * Logs an error message if fetching data fails and updates the error state.
 * Finally, sets the loading state to false after completion.
 */
const PropertyPage = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPropertyData = async (id, setProperty, setLoading, setError) => {
    if (!id) return;
    try {
      const property = await fetchProperty(id);
      setProperty(property);
    } catch (error) {
      console.error('Error fetching property data:', error);
      setError('Failed to load property data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (property === null) {
      fetchPropertyData(id, setProperty, setLoading, setError);
    }
  }, [id, property]);

  return (
    <div>
      {error && <div className='text-red-500'>{error}</div>}
      <div className='text-3xl'>PropertyPage</div>
    </div>
  );
};

export default PropertyPage;
