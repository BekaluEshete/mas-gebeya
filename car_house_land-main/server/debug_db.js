require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    const uri = process.env.MONGO_URI || "mongodb+srv://temesgenmarie:123456Tom@cluster0.mxzpylr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    console.log('Testing connection to:', uri.split('@')[1]);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testConnection();
