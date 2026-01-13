/**
 * Database Configuration
 *
 * This file handles MongoDB connection using Mongoose.
 *
 * CONCEPT: Mongoose is an ODM (Object Document Mapper) for MongoDB.
 * It provides a schema-based solution to model your application data.
 * Think of it like a translator between your TypeScript code and MongoDB.
 */
/**
 * Connect to MongoDB
 *
 * This function establishes a connection to the MongoDB database.
 * It should be called once when the server starts.
 */
export declare const connectDB: () => Promise<void>;
/**
 * Disconnect from MongoDB
 *
 * Useful for graceful shutdown and testing.
 */
export declare const disconnectDB: () => Promise<void>;
export default connectDB;
//# sourceMappingURL=db.d.ts.map