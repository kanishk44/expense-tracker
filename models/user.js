const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.virtual("forgotPasswordRequests", {
  ref: "ForgotPasswordRequest",
  localField: "_id",
  foreignField: "userId",
});

module.exports = mongoose.model("User", userSchema);
