const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor.js');
const Patient = require('../models/Patient.js');
const authenticate = require('../middlewares/authMiddleware.js');
require('dotenv').config();

const router = express.Router();

// Helper function to generate unique codes
const generateCode = (prefix, count) => `${prefix}${String(count + 1).padStart(3, '0')}`;

// Register Doctor
router.post('/register/doctor', async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) return res.status(400).json({ message: 'Doctor already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctorCount = await Doctor.countDocuments();
    const doctorCode = generateCode('DOC', doctorCount);

    const doctor = new Doctor({ doctorCode, name, email, password: hashedPassword, specialty });
    await doctor.save();

    res.status(201).json({ message: 'Doctor registered', doctorCode });
  } catch (error) {
    res.status(500).json({ message: 'Error registering doctor', error });
  }
});

// Register Patient
router.post('/register/patient', async (req, res) => {
  try {
    const { name, email, password, doctorCode, healthData } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) return res.status(400).json({ message: 'Patient already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const patientCount = await Patient.countDocuments();
    const patientCode = generateCode('PAT', patientCount);

    const patient = new Patient({ patientCode, name, email, password: hashedPassword, healthData, doctorCodes: [doctorCode] });
    await patient.save();

    await Doctor.findOneAndUpdate({ doctorCode }, { $push: { patients: patientCode } });

    res.status(201).json({ message: 'Patient registered', patientCode });
  } catch (error) {
    res.status(500).json({ message: 'Error registering patient', error });
  }
});

// Login (Doctor & Patient)
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const Model = role === 'doctor' ? Doctor : Patient;

    const user = await Model.findOne({ email });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: `${role} logged in`, token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Get Doctor's Patients (Protected Route)
router.get('/doctor/patients', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Access denied' });

    const doctor = await Doctor.findById(req.user.id).populate('patients');
    res.status(200).json(doctor.patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
});

// Assign Patient to Doctor
router.post('/assign-patient', authenticate, async (req, res) => {
    try {
      const { doctorCode, patientCode } = req.body;
  
      // Ensure only doctors can assign patients
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Only doctors can assign patients.' });
      }
  
      // Find doctor and patient by their unique codes
      const doctor = await Doctor.findOne({ doctorCode });
      const patient = await Patient.findOne({ patientCode });
  
      if (!doctor || !patient) {
        return res.status(404).json({ message: 'Doctor or Patient not found' });
      }
  
      // Check if the patient is already assigned
      if (doctor.patients.includes(patientCode)) {
        return res.status(400).json({ message: 'Patient already assigned to this doctor' });
      }
  
      // Update doctor and patient records
      doctor.patients.push(patientCode);
      patient.doctorCodes.push(doctorCode);
  
      await doctor.save();
      await patient.save();
  
      res.status(200).json({
        message: 'Patient successfully assigned to doctor',
        doctorCode,
        patientCode,
      });
    } catch (error) {
      console.error('Error assigning patient:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });
  

module.exports = router;
