import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';

// GET /api/properties
/**
 * Asynchronous function to handle GET requests.
 * Connects to the database, retrieves properties using Mongoose,
 * sorts them by creation date, and returns the properties with count.
 * If an error occurs, logs the error and returns a 500 status response.
 *
 * @param {Object} request - The request object.
 * @returns {Object} The JSON response with properties data and status code.
 */
export const GET = async (request) => {
  try {
    await connectDB();

    // Acquire properties via mongoose
    const properties = await Property.find({});
    properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const data = {
      count: properties.length,
      properties,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error in GET request: ${error}`, request);
    return NextResponse.json('An error occurred while processing the request', {
      status: 500,
    });
  }
};
