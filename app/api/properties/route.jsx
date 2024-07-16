import connectDB from '@/config/db';
import { NextResponse } from 'next/server';

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();
    return NextResponse.json({ message: 'Hello World' }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET request: ${error}`);
    return new Response('An error occurred while processing the request', {
      status: 500,
    });
  }
};
