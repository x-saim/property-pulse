import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';

// GET /api/properties/user/[userId]
/**
 * Handles GET request to retrieve properties belonging to a specific user.
 *
 * @param {Object} request - The request object.
 * @param {Object} params - The parameters object containing the userId.
 * @returns {Object} The response object with properties or an error message.
 */
export const GET = async (request, { params }) => {
  try {
    await connectDB();

    const { userId } = params;

    if (!userId) {
      return NextResponse('User ID is required', { status: 400 });
    }

    const properties = await Property.find({ owner: userId });

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse('Something went wrong', { status: 500 });
  }
};
