const Razorpay = require("razorpay");
const Order = require("../models/order");
const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");
const { JWT_SECRET } = require("../middleware/auth");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PREMIUM_AMOUNT = 100; // ₹1 in paise

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { description, amount, category } = req.body;

    const options = {
      amount: PREMIUM_AMOUNT,
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    await Order.create(
      {
        orderId: order.id,
        status: "PENDING",
        userId: req.user.userId,
        amount: PREMIUM_AMOUNT,
      },
      { transaction: t }
    );

    await t.commit();
    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { order_id, payment_id, razorpay_signature, status } = req.body;

    if (status === "FAILED" && !payment_id) {
      await Order.update(
        { status: "FAILED" },
        {
          where: { orderId: order_id },
          transaction: t,
        }
      );
      await t.commit();
      return res.json({ message: "Order marked as failed" });
    }

    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await Order.update(
        { status: "FAILED" },
        {
          where: { orderId: order_id },
          transaction: t,
        }
      );
      await t.commit();
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status === "captured") {
      await Order.update(
        { status: "COMPLETED", paymentId: payment_id },
        {
          where: { orderId: order_id },
          transaction: t,
        }
      );

      await User.update(
        { isPremium: true },
        {
          where: { id: req.user.userId },
          transaction: t,
        }
      );

      const user = await User.findByPk(req.user.userId, { transaction: t });
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          isPremium: true,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      await t.commit();
      res.json({
        message: "Payment successful",
        token,
      });
    } else {
      await Order.update(
        { status: "FAILED", paymentId: payment_id },
        {
          where: { orderId: order_id },
          transaction: t,
        }
      );
      await t.commit();
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (err) {
    await t.rollback();
    try {
      await Order.update(
        { status: "FAILED" },
        { where: { orderId: req.body.order_id } }
      );
    } catch (updateErr) {}
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
