const mongoose = require('mongoose');
require('dotenv').config();

// Use environment variable or default to localhost
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Successfully connected to MongoDB!');

        // Check if we can perform a simple operation
        try {
            // Try to list collections first (less permissions required)
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('\nAvailable collections:');
            collections.forEach(collection => {
                console.log(`- ${collection.name}`);
            });
        } catch (err) {
            // If listing collections fails, try listing databases (requires admin)
            try {
                const adminDb = mongoose.connection.db.admin();
                const dbList = await adminDb.listDatabases();
                console.log('\nAvailable databases:');
                dbList.databases.forEach(db => {
                    console.log(`- ${db.name}`);
                });
            } catch (adminErr) {
                console.log('Could not list databases (requires admin privileges)');
            }
        }

        console.log('\nConnection test completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    } finally {
        // Close the connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        }
    }
}

testConnection();