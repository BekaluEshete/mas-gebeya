const nodemailer = require("nodemailer");

async function testEmail() {
    console.log("Testing Email Credentials...");
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "bekelueshete@gmail.com",
            pass: "oktk qgxo ttqu rhmp"
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        const info = await transporter.sendMail({
            from: '"Test" <bekelueshete@gmail.com>',
            to: "bekelueshete@gmail.com", // Send to self
            subject: "Test Email from Local Debugger",
            text: "If you see this, the credentials are working!"
        });
        console.log("SUCCESS! Email sent:", info.messageId);
    } catch (error) {
        console.error("FAILED:", error.message);
    }
}

testEmail();
