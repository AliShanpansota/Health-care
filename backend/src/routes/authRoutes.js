// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const authenticate = require("../middlewares/authMiddleware");
require("dotenv").config();

const router = express.Router();

// Helper function to generate unique codes
const generateCode = (prefix, count) =>
  `${prefix}${String(count + 1).padStart(3, "0")}`;

// ── REGISTER DOCTOR ───────────────────────────────────────────────────────────
router.post("/register/doctor", async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;
    if (await Doctor.findOne({ email })) {
      return res.status(400).json({ message: "Doctor already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate next DOC code by looking at highest existing
    const lastDoc = await Doctor.findOne().sort({ doctorCode: -1 }).exec();
    const lastNum = lastDoc?.doctorCode.match(/DOC(\d+)/)?.[1] ?? 0;
    const doctorCode = generateCode("DOC", parseInt(lastNum));

    const doctor = new Doctor({
      doctorCode,
      name,
      email,
      password: hashedPassword,
      specialty,
    });
    await doctor.save();

    return res.status(201).json({ message: "Doctor registered", doctorCode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error registering doctor" });
  }
});

// ── REGISTER PATIENT ──────────────────────────────────────────────────────────
router.post("/register/patient", async (req, res) => {
  try {
    const { name, email, password, doctorCode } = req.body;
    if (await Patient.findOne({ email })) {
      return res.status(400).json({ message: "Patient already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate next PAT code
    const lastPat = await Patient.findOne().sort({ patientCode: -1 }).exec();
    const lastNum = lastPat?.patientCode.match(/PAT(\d+)/)?.[1] ?? 0;
    const patientCode = generateCode("PAT", parseInt(lastNum));

    // Find doctor by its code, get its _id
    const doctor = await Doctor.findOne({ doctorCode });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Create patient with doctor._id in doctorCodes
    const patient = new Patient({
      patientCode,
      name,
      email,
      password: hashedPassword,
      doctorCodes: [doctor._id],
    });
    await patient.save();

    // Add this new patient._id into doctor.patients array
    doctor.patients.push(patient._id);
    await doctor.save();

    return res.status(201).json({ message: "Patient registered", patientCode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error registering patient" });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const Model = role === "doctor" ? Doctor : Patient;
    const user = await Model.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({ message: `${role} logged in`, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error logging in" });
  }
});

// ── PROFILE ────────────────────────────────────────────────────
router.get("/profile", authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = role === "doctor" ? Doctor : Patient;
    let user = await Model.findById(id).select("-password").lean();

    // If patient, also populate assigned doctors
    if (role === "patient") {
      user.doctors = await Doctor.find({ _id: { $in: user.doctorCodes } })
        .select("name doctorCode specialty _id")
        .lean();
    }

    return res.status(200).json({ profile: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
});
// ── DOCTOR’S PATIENTS ────────────────────────────────────────────────────────
router.get("/doctor/patients", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const patients = await Patient.find({ _id: { $in: doctor.patients } })
      .select("name patientCode")
      .lean();

    return res.status(200).json(patients);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching patients" });
  }
});

// ── PATIENT’S DOCTORS ────────────────────────────────────────────────────────
router.get("/patient/doctors", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied" });
    }
    const patient = await Patient.findById(req.user.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const doctors = await Doctor.find({ _id: { $in: patient.doctorCodes } })
      .select("name doctorCode specialty")
      .lean();

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching doctors" });
  }
});

// ── ASSIGN PATIENT TO DOCTOR ────────────────────────────────────────────────
router.post("/assign-patient", authenticate, async (req, res) => {
  try {
    console.log("▶️  /assign-patient called", req.user, req.body);

    if (req.user.role !== "doctor")
      return res
        .status(403)
        .json({ message: "Only doctors can assign patients" });

    const { doctorCode, patientCode } = req.body;
    const doctor = await Doctor.findOne({ doctorCode });
    const patient = await Patient.findOne({ patientCode });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Ensure arrays exist
    doctor.patients = doctor.patients || [];
    patient.doctorCodes = patient.doctorCodes || [];

    // Prevent duplicates
    const already = doctor.patients.some(
      (id) => id.toString() === patient._id.toString(),
    );
    if (already) {
      return res.status(400).json({ message: "Patient already assigned" });
    }

    // Push and save
    doctor.patients.push(patient._id);
    patient.doctorCodes.push(doctor._id);

    await Promise.all([doctor.save(), patient.save()]);

    console.log("    ✅ Assigned", patientCode, "to", doctorCode);
    return res.status(200).json({ message: "Patient successfully assigned" });
  } catch (err) {
    console.error("🔥 Error in /assign-patient:", err);
    console.error("    ▶ Request body was:", req.body);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
