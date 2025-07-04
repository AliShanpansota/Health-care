const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientCode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  doctorCodes: [{ type: String }], // Store doctorCodes instead of ObjectId
  healthData: {
    heartbeat: Number,
    diseases: [String],
  },
});

module.exports = mongoose.model('Patient', patientSchema);
