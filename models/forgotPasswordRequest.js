const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ForgotPasswordRequest",
  forgotPasswordRequestSchema
);
