import mongoose from 'mongoose';

let connected = false;

const connectDB = async () => {
  //We set `strictQuery` to `true` so that Mongoose will ensure that only the fields that are specified in our schema will be saved in the database
  mongoose.set('strictQuery', true);

  if (connected) {
    console.log('MongoDB is already connected...');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    connected = true;

    console.log('MongoDB connected...');
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
