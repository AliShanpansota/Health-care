const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorCode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  specialty: { type: String },
  patients: {
    type: [String], // ✅ store patientCodes here
    default: [],
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
