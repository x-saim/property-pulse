import connectDB from '@/config/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';
import { revalidatePath } from 'next/cache';
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

// PUT /api/properties/:id
export const PUT = async (request, { params }) => {
  try {
    await connectDB();
    const { id } = params;

    // Get and validate user ID from session
    const { userId } = await getSessionUser();

    // Fetch the existing property's data
    const existingProperty = await Property.findById(id);

    // Check if the user is the owner of the property
    if (existingProperty.owner.toString() !== userId) {
      return NextResponse.json('Unauthorized.', { status: 401 });
    }

    // Access form data
    const formData = await request.formData();

    // Access all values for amenities and images
    const amenities = formData.getAll('amenities');

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

    // Update the property with the propertyData object
    await Property.findByIdAndUpdate(id, propertyData);

    revalidatePath('/properties');
    return NextResponse.json('Property Updated.', { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse.json(
      { error: 'Failed to update property.' },
      { status: 500 }
    );
  }
};
