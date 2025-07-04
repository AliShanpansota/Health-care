const mongoose = require("mongoose");

const healthDataSchema = new mongoose.Schema({
  heartbeat: Number,
  diseases: [String],
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

const patientSchema = new mongoose.Schema({
  patientCode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  doctorCodes: {
    type: [String], // ✅ store doctorCodes here
    default: [],
  },
  healthData: {
    type: [healthDataSchema],
    default: [],
  },
});

module.exports = mongoose.model("Patient", patientSchema);
