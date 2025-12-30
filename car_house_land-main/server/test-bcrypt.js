const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const password = 'newpassword123';
    console.log('Testing bcryptjs...');
    console.log('Plain text:', password);

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hash);

    const match = await bcrypt.compare(password, hash);
    console.log('Comparison result (correct password):', match);

    const fail = await bcrypt.compare('wrongpassword', hash);
    console.log('Comparison result (wrong password):', fail);
}

testBcrypt().catch(console.error);
