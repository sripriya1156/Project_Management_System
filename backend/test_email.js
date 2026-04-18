const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('--- Email Debug Test ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT FOUND');
console.log('EMAIL_PASS defined:', !!process.env.EMAIL_PASS);
if (process.env.EMAIL_PASS) {
    console.log('EMAIL_PASS: [' + process.env.EMAIL_PASS + ']');
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS.length);
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: `Spritflow Test <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: 'Spritflow Test Email',
  text: 'If you see this, your email configuration is correct!'
};

console.log('Sending test email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('FAILED TO SEND EMAIL.');
    console.error('Error Code:', error.code);
    console.error('Response:', error.response);
    console.error('Full Error:', error.message);
  } else {
    console.log('SUCCESS! Email sent: ' + info.response);
  }
  process.exit();
});
