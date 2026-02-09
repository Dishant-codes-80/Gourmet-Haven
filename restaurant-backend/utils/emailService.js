const nodemailer = require('nodemailer');

// Create a shared transporter with more robust configuration for deployment
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Add timeouts to handle potential network lag in cloud environments
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Order Confirmed! Your Gourmet Haven order #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="background-color: #e74c3c; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Hello <strong>${order.customer}</strong>,</p>
          <p style="font-size: 16px; color: #7f8c8d; line-height: 1.6;">Thank you for ordering from Gourmet Haven! We've received your order and our chefs are already preparing something delicious for you.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h3 style="color: #e74c3c; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
            <p style="margin: 10px 0;"><strong>Order ID:</strong> #${order._id}</p>
            <p style="margin: 10px 0;"><strong>Type:</strong> ${order.orderType}</p>
            <p style="margin: 10px 0;"><strong>Total Amount:</strong> ₹${order.total.toFixed(0)}</p>
            <p style="margin: 10px 0;"><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p style="margin: 10px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          ${order.orderType === 'Online' ? `
          <div style="margin: 20px 0; padding: 20px; border: 1px dashed #e74c3c; border-radius: 8px;">
            <h4 style="margin-top: 0; color: #2c3e50;">Delivery Details:</h4>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${order.deliveryAddress}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #95a5a6; font-size: 14px;">If you have any questions, feel free to contact us at +91 98765 43210.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #2c3e50; font-weight: bold; font-size: 18px; margin: 0;">Gourmet Haven</p>
            <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">Fine Dining Excellence</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send reservation confirmation email
 */
const sendReservationConfirmation = async (details) => {
  const { name, email, date, time, guests, table, token } = details;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Reservation Confirmed - Gourmet Haven`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">Reservation Confirmed</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 18px; color: #2c3e50; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #7f8c8d; line-height: 1.6;">Your table has been reserved! We look forward to serving you at Gourmet Haven.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h3 style="color: #2c3e50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Reservation Details</h3>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 10px 0;"><strong>Guests:</strong> ${guests}</p>
            <p style="margin: 10px 0;"><strong>Table:</strong> ${table || 'Assigned on arrival'}</p>
            <p style="margin: 10px 0;"><strong>Booking Token:</strong> ${token}</p>
          </div>

          <p style="font-size: 14px; color: #e74c3c; font-style: italic;">Please keep your booking token handy. You can use it to place an advance order or show it when you arrive.</p>

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #95a5a6; font-size: 14px;">If you need to change or cancel your reservation, please call us at +91 98765 43210.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #2c3e50; font-weight: bold; font-size: 18px; margin: 0;">Gourmet Haven</p>
            <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">Fine Dining Excellence</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reservation confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendReservationConfirmation
};
