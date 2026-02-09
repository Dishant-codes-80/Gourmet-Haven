const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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
    console.log('Order confirmation email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail };
