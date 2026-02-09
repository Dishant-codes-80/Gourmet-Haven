const nodemailer = require("nodemailer");

/**
 * Gmail SMTP transporter (Render-safe)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
  connectionTimeout: 10000, // 10s
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    servername: "smtp.gmail.com",
  },
});

// Verify SMTP connection on startup (VERY IMPORTANT for Render logs)
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verify failed:", err);
  } else {
    console.log("✅ SMTP server ready to send emails");
  }
});

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Order Confirmed! Your Gourmet Haven order #${order._id
      .toString()
      .slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#e74c3c;">Order Confirmed 🎉</h2>
        <p>Hello <strong>${order.customer}</strong>,</p>
        <p>Your order has been successfully placed.</p>

        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Type:</strong> ${order.orderType}</p>
        <p><strong>Total:</strong> ₹${order.total.toFixed(0)}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p><strong>Status:</strong> ${order.paymentStatus}</p>

        ${order.orderType === "Online"
        ? `
        <h4>Delivery Details</h4>
        <p><strong>Address:</strong> ${order.deliveryAddress}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
        `
        : ""
      }

        <hr />
        <p style="font-size:12px;color:#777;">
          Thank you for choosing <strong>Gourmet Haven</strong>.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Order email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending order email:", error);
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
    subject: "Reservation Confirmed – Gourmet Haven",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#2c3e50;">Reservation Confirmed 🍽️</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your table has been reserved successfully.</p>

        <h3>Reservation Details</h3>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Guests:</strong> ${guests}</p>
        <p><strong>Table:</strong> ${table || "Assigned on arrival"}</p>
        <p><strong>Token:</strong> ${token}</p>

        <hr />
        <p style="font-size:12px;color:#777;">
          We look forward to serving you at <strong>Gourmet Haven</strong>.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reservation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending reservation email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendReservationConfirmation,
};
