const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  user: String,
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
