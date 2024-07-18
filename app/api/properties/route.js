import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';

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

export const POST = async (request) => {
  try {
    await connectDB();

    // Get user ID from session
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse('User ID is required.', { status: 401 });
    }

    const { userId } = sessionUser;

    // Access form data
    const formData = await request.formData();

    // Access all values for amenities and images
    const amenities = formData.getAll('amenities');
    const images = formData
      .getAll('images')
      .filter((image) => image.name !== '');

    // Create the propertyData object with embedded seller_info
    const propertyData = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      square_feet: formData.get('square_feet'),
      amenities,
      rates: {
        weekly: formData.get('rates.weekly'),
        monthly: formData.get('rates.monthly'),
        nightly: formData.get('rates.nightly.'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      owner: userId,
      // images,
    };

    const newProperty = new Property(propertyData);
    await newProperty.save();

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    );
  } catch (error) {
    return new Response('Failed to add property', { status: 500 });
  }
};
