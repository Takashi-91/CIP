const mongoose = require("mongoose");
const dotenv = require("dotenv");
const e = require("express");
dotenv.config();

const paymentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  currency: String,
  recipient: String,
  date: { type: Date, default: Date.now },
});
const Payment = mongoose.model("Payment", paymentSchema);

exports.Payment = Payment;