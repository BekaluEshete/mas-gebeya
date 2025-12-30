const mongoose = require('mongoose');

async function testConnection() {
    const uri = "mongodb+srv://temesgenmarie:123456Tom@cluster0.mxzpylr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    console.log('Testing connection to FALLBACK:', uri.split('@')[1]);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected successfully to FALLBACK');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed to FALLBACK');
        console.error('Message:', err.message);
        process.exit(1);
    }
}

testConnection();
