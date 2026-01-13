/**
 * Database Configuration
 *
 * This file handles MongoDB connection using Mongoose.
 *
 * CONCEPT: Mongoose is an ODM (Object Document Mapper) for MongoDB.
 * It provides a schema-based solution to model your application data.
 * Think of it like a translator between your TypeScript code and MongoDB.
 */
import mongoose from 'mongoose';
import { env } from './env.js';
/**
 * Connect to MongoDB
 *
 * This function establishes a connection to the MongoDB database.
 * It should be called once when the server starts.
 */
export const connectDB = async () => {
    try {
        // mongoose.connect() returns a Promise that resolves when connected
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        // Log the database name for debugging
        console.log(`📦 Database: ${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        // Exit process with failure code (1)
        process.exit(1);
    }
};
/**
 * Disconnect from MongoDB
 *
 * Useful for graceful shutdown and testing.
 */
export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('📤 MongoDB Disconnected');
    }
    catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map