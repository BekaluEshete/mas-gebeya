// services/emailService.js
const nodemailer = require("nodemailer");

/**
 * Create a Nodemailer transporter
 */
const createTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "bekelueshete@gmail.com",
      pass: process.env.SMTP_PASS || "oktk qgxo ttqu rhmp"
    },
    tls: { rejectUnauthorized: false }
  });
};

/**
 * Send Email Utility
 */
const sendEmail = async (options) => {
  try {
    console.log(`[sendEmail] Preparing to send email to: ${options.email}`);
    const transporter = createTransporter();
    console.log(`[sendEmail] Transporter created. Host: ${process.env.SMTP_HOST || "smtp.gmail.com"}, User: ${process.env.SMTP_USER || "bekelueshete@gmail.com"}`);

    const mailOptions = {
      from: process.env.MAIL_FROM || `"Massgebeya" <${process.env.SMTP_USER || "bekelueshete@gmail.com"}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, "") // fallback plain text
    };

    console.log(`[sendEmail] Sending mail... Subject: ${options.subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("📨 [sendEmail] Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ [sendEmail] Email sending failed:", error.message);
    if (error.stack) console.error(error.stack);
    throw new Error(`Email could not be sent. Error: ${error.message}`);
  }
};

/**
 * Common Email Wrapper
 */
const wrapEmail = (title, content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
              padding: 20px; background-color: #fdf9f4; border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">Massgebeya</h1>
      <p style="color: #666; margin: 5px 0;">Your Trusted Marketplace</p>
    </div>

    <!-- Title -->
    <h2 style="color: #A67B5B; font-size: 26px; text-align: center;">${title}</h2>

    <!-- Content -->
    <div style="font-size: 16px; color: #555; line-height: 1.6;">
      ${content}
    </div>

    <hr style="border: none; border-top: 1px solid #e8ddd3; margin: 30px 0;" />

    <!-- Footer -->
    <div style="font-size: 14px; color: #666; text-align: center;">
      <p>© ${new Date().getFullYear()} Massgebeya. All rights reserved.</p>
      <p>Need help? Contact us at <a href="mailto:support@massgebeya.com">support@massgebeya.com</a></p>
    </div>
  </div>
`;

/**
 * Email Templates
 */
const emailTemplates = {
  welcome: (name) => ({
    subject: "🎉 Welcome to Masgebeya!",
    html: wrapEmail("Welcome to Massgebeya", `
      <p>Hi ${name},</p>
      <p>Thank you for joining <strong>Masgebeya</strong>, Ethiopia's trusted marketplace for cars, properties, lands, and machinery.</p>
      <ul style="color: #555; line-height: 1.8;">
        <li>Browse thousands of verified listings</li>
        <li>Contact dealers and owners directly</li>
        <li>Save your favorite items</li>
        <li>Make offers and negotiate deals</li>
        <li>Get notifications on price changes</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}" 
           style="background: #2563eb; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Start Exploring
        </a>
      </div>
    `)
  }),

  verificationCode: (name, code) => ({
    subject: "🔑 Verify Your Email - Massgebeya",
    html: wrapEmail("Email Verification", `
      <p>Hi ${name},</p>
      <p>Please verify your email using the code below:</p>
      <div style="font-size: 32px; font-weight: bold; color: #A67B5B;
                  letter-spacing: 8px; text-align: center; margin: 30px 0;">
        ${code}
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 24 hours.</p>
    `),
    text: `Your Massgebeya verification code is: ${code}\nThis code expires in 24 hours.`
  }),

  passwordReset: (name, code) => ({
    subject: "🔐 Reset Your Password - Massgebeya",
    html: wrapEmail("Password Reset", `
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Use the code below:</p>
      <div style="font-size: 24px; font-weight: bold; color: #A67B5B;
                  text-align: center; margin: 30px 0;">
        ${code}
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
    `),
    text: `Your Massgebeya password reset code is: ${code}\nThis code expires in 15 minutes.`
  }),

  adminNotification: (message, user) => {
    const fullName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "N/A";

    return {
      subject: '⚠️ Admin Notification - Massgebeya',
      html: wrapEmail('Admin Notification', `
      <p>${message}</p>
      <h4 style="color: #333;">User Details:</h4>
      <ul style="color: #555; line-height: 1.8;">
        <li><strong>Full Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${user?.email || "N/A"}</li>
        <li><strong>Phone:</strong> ${user?.phoneNumber || "N/A"}</li>
        <li><strong>Location:</strong> ${user?.location || "N/A"}</li>
      </ul>
    `),
      text: `
      Admin Notification:
      ${message}

      User Details:
      - Full Name: ${fullName}
      - Email: ${user?.email || "N/A"}
      - Phone: ${user?.phoneNumber || "N/A"}
      - Location: ${user?.location?.city || "N/A"}
    `
    };
  },


  dealCreated: (firstName, dealId, itemTitle) => ({
    subject: "🎉 New Deal Created - Massgebeya",
    html: wrapEmail("Deal Created", `
      <p>Hi ${firstName},</p>
      <p>Congratulations! You've created a new deal for <strong>${itemTitle}</strong>.</p>
      <ul style="color: #555; line-height: 1.8;">
        <li><strong>Deal ID:</strong> ${dealId}</li>
        <li><strong>Item:</strong> ${itemTitle}</li>
      </ul>
      <p style="color: #555;">The seller has been notified and will review your offer soon.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/deals/${dealId}" 
           style="background: #2563eb; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          View Deal
        </a>
      </div>
    `),
    text: `Hi ${firstName},\nYou've created a new deal for ${itemTitle}.\nDeal ID: ${dealId}\nView: ${process.env.CLIENT_URL}/deals/${dealId}`
  }),

  dealAccepted: (firstName, itemTitle, price, sellerContact) => ({
    subject: "✅ Deal Accepted - Massgebeya",
    html: wrapEmail("Deal Accepted", `
      <p>Hi ${firstName},</p>
      <p>Great news! Your deal for <strong>${itemTitle}</strong> has been accepted.</p>
      <ul style="color: #555; line-height: 1.8;">
        <li><strong>Item:</strong> ${itemTitle}</li>
        <li><strong>Agreed Price:</strong> ${price}</li>
        <li><strong>Seller Contact:</strong> ${sellerContact}</li>
      </ul>
      <p>Please contact the seller to finalize payment and delivery details.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/deals" 
           style="background: #2563eb; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          View Your Deals
        </a>
      </div>
      <div style="margin: 20px 0; padding: 15px; background: #fef2f2; border-radius: 6px;
                  border-left: 4px solid #dc2626;">
        <p style="color: #dc2626; margin: 0; font-size: 14px;">
          <strong>Important:</strong> Ensure all transactions are secure and verified.
          Contact support if you encounter any issues.
        </p>
      </div>
    `),
    text: `Hi ${firstName},\nYour deal for ${itemTitle} has been accepted!\nAgreed Price: ${price}\nSeller Contact: ${sellerContact}`
  })
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter
};
