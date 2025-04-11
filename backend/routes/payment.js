const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/createorder", paymentController.createOrder);
router.post("/updatestatus", paymentController.updatePaymentStatus);

module.exports = router;
