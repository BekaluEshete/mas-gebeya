const mongoose = require('mongoose');

async function testConnection() {
    const uri = "mongodb://localhost:27017/car_house_land";
    console.log('Testing connection to LOCAL:', uri);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected successfully to LOCAL');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed to LOCAL');
        console.error('Message:', err.message);
        process.exit(1);
    }
}

testConnection();
