/**
 * Server Entry Point
 *
 * This is where the application starts.
 * It connects to the database and starts the Express server.
 */
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
/**
 * Start Server
 *
 * 1. Connect to MongoDB
 * 2. Start Express server
 * 3. Handle graceful shutdown
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        // Start Express server
        const server = app.listen(env.PORT, () => {
            console.log('');
            console.log('🚀 Server started successfully!');
            console.log(`📡 Port: ${env.PORT}`);
            console.log(`🌍 Environment: ${env.NODE_ENV}`);
            console.log(`🔗 URL: http://localhost:${env.PORT}`);
            console.log(`💚 Health: http://localhost:${env.PORT}/health`);
            console.log('');
        });
        // Graceful shutdown handlers
        const shutdown = async (signal) => {
            console.log(`\n📤 ${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                console.log('✅ HTTP server closed');
                // Disconnect from database
                const mongoose = await import('mongoose');
                await mongoose.default.disconnect();
                console.log('✅ MongoDB disconnected');
                process.exit(0);
            });
        };
        // Listen for termination signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
//# sourceMappingURL=index.js.map