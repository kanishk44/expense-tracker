const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.post("/forgotpassword", passwordController.forgotPassword);
router.get("/resetpassword/:id", passwordController.getResetPasswordPage);
router.post("/resetpassword/:id", passwordController.resetPassword);

module.exports = router;
