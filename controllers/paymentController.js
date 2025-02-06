const Razorpay = require("razorpay");
const Order = require("../models/order");
const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PREMIUM_AMOUNT = 100; // ₹1 in paise

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
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { order_id, payment_id, razorpay_signature, status } = req.body;

    if (status === "FAILED" && !payment_id) {
      await Order.findOneAndUpdate({ orderId: order_id }, { status: "FAILED" });
      return res.json({ message: "Order marked as failed" });
    }

    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await Order.findOneAndUpdate({ orderId: order_id }, { status: "FAILED" });
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status === "captured") {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          status: "COMPLETED",
          paymentId: payment_id,
        }
      );

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { isPremium: true },
        { new: true }
      );

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          isPremium: true,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Payment successful",
        token,
      });
    } else {
      await Order.findOneAndUpdate(
        { orderId: order_id },
        {
          status: "FAILED",
          paymentId: payment_id,
        }
      );
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (err) {
    console.error("Error updating payment status:", err);
    try {
      await Order.findOneAndUpdate(
        { orderId: req.body.order_id },
        { status: "FAILED" }
      );
    } catch (updateErr) {
      console.error("Error updating order status:", updateErr);
    }
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
