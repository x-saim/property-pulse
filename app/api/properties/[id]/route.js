import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';

// GET /api/properties/:id
export const GET = async (request, { params }) => {
  try {
    await connectDB();

    const property = await Property.findById(params.id);
    if (!property)
      return NextResponse.json('Property not found', { status: 404 });

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    console.error(`Error in GET request: ${error}`, request);
    return NextResponse.json('An error occurred while processing the request', {
      status: 500,
    });
  }
};
