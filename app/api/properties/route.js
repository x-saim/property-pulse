import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary.js';
import { revalidatePath } from 'next/cache';

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

// POST /api/properties
/**
 * Handles the POST request to add a new property to the database.
 * Retrieves the user ID from the session and validates its presence.
 * Processes form data to create a new property object with seller information.
 * Saves the new property to the database and redirects to the property details page upon success.
 * If an error occurs, logs the error and returns a JSON response with an error message.
 *
 * @param {Object} request - The request object containing form data.
 * @returns {Object} - Returns a NextResponse object based on the success or failure of adding the property.
 */
export const POST = async (request) => {
  try {
    await connectDB();

    // Get user ID from session
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 401 }
      );
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
        nightly: formData.get('rates.nightly'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      owner: userId,
    };

    // Cloudinary image handling
    // Access the uploaded files from the form data
    const imageUploadPromises = [];

    for (const image of images) {
      // Assuming image is a File object, extract the file data
      const mimeType = image.type;
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);

      // Convert the image data to base64
      const imageBase64 = imageData.toString('base64');

      // Upload the image data as a base64 string to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${imageBase64}`,
        {
          folder: 'propertypulse',
        }
      );

      imageUploadPromises.push(result.secure_url);
    }

    // Wait for all image uploads to complete
    const uploadedImages = await Promise.all(imageUploadPromises);

    // Add the uploaded images to the propertyData object
    propertyData.images = uploadedImages;
    const newProperty = new Property(propertyData);
    await newProperty.save();

    revalidatePath('/properties');
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    );
  } catch (error) {
    console.error(error);
    return new NextResponse.json(
      { error: 'Failed to add property' },
      { status: 500 }
    );
  }
};
