import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

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

// DELETE /api/properties/:id
// Deleting respective property images from cloudinary
export const DELETE = async (request, { params }) => {
  try {
    const propertyId = params.id;

    // Verify user that owns the listing is the user from the session.
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json('User ID is required', { status: 401 });
    }

    const { userId } = sessionUser;

    // Connect to db and acquire specific property.
    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) NextResponse.json('Property Not Found', { status: 404 });

    // Verify ownership
    if (property.owner.toString() !== userId) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }

    // Extract public id's from image url in DB
    const publicIds = property.images.map((imageUrl) => {
      const parts = imageUrl.split('/');
      return parts.at(-1).split('.').at(0);
    });

    // Delete images from Cloudinary
    if (publicIds.length > 0) {
      for (let publicId of publicIds) {
        await cloudinary.uploader.destroy('propertypulse/' + publicId);
      }
    }

    // Delete property
    await property.deleteOne();

    return NextResponse.json('Property Deleted', { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json('Something went wrong', { status: 500 });
  }
};
