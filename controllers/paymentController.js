const Razorpay = require("razorpay");
const Order = require("../models/order");
const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PREMIUM_AMOUNT = 2500; // ₹25 in paise

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: PREMIUM_AMOUNT,
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    await Order.create({
      orderId: order.id,
      status: "PENDING",
      userId: req.user.userId,
      amount: PREMIUM_AMOUNT,
    });

    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { order_id, payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await Order.update(
        { status: "FAILED" },
        { where: { orderId: order_id } }
      );
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Verify payment status with Razorpay
    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status === "captured") {
      await Order.update(
        { status: "COMPLETED", paymentId: payment_id },
        { where: { orderId: order_id } }
      );
      await User.update(
        { isPremium: true },
        { where: { id: req.user.userId } }
      );

      // Generate new token with updated premium status
      const user = await User.findByPk(req.user.userId);
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          isPremium: true,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Payment successful",
        token, // Send new token
      });
    } else {
      await Order.update(
        { status: "FAILED", paymentId: payment_id },
        { where: { orderId: order_id } }
      );
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (err) {
    console.error(err);
    // Update order status to FAILED if there's an error
    await Order.update(
      { status: "FAILED" },
      { where: { orderId: req.body.order_id } }
    );
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
