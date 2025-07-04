const express = require("express");
const expressWs = require("express-ws"); // Import express-ws
const router = express.Router();
const Patient = require("../models/Patient");
const authenticate = require("../middlewares/authMiddleware");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
// Initialize WebSocket support
expressWs(router);

// Function to calculate moving average
const calculateMovingAverage = (data, windowSize) => {
  if (data.length < windowSize) {
    return null;
  }
  let sum = 0;
  for (let i = 0; i < windowSize; i++) {
    sum += data[i];
  }
  return sum / windowSize;
};

// Function to calculate standard deviation
const calculateStandardDeviation = (data, mean) => {
  if (data.length <= 1) {
    return null;
  }
  let sumOfSquares = 0;
  for (let i = 0; i < data.length; i++) {
    sumOfSquares += Math.pow(data[i] - mean, 2);
  }
  return Math.sqrt(sumOfSquares / (data.length - 1));
};

// Function to generate personalized health recommendations
const generateRecommendations = (healthData, anomaly) => {
  const { heartbeat, spo2 } = healthData;
  const recommendations = [];

  // General recommendations
  if (heartbeat > 90) {
    recommendations.push(
      "Try some relaxation techniques to lower your heart rate.",
    );
  } else if (heartbeat < 60) {
    recommendations.push(
      "Consider consulting with your doctor about your low heart rate.",
    );
  }

  if (spo2 < 95) {
    recommendations.push(
      "Ensure you are getting enough oxygen. Consider consulting with your doctor.",
    );
  }

  // Anomaly-specific recommendations
  if (anomaly.isAnomalous) {
    recommendations.push(anomaly.message);
    recommendations.push(
      "Consult your doctor immediately to address this anomaly.",
    );
  }
  // Additional recommendations based on historical data can be added here

  return recommendations;
};

// WebSocket route for real-time health data
router.ws("/patient/health-data-stream", (ws, req) => {
  console.log("Patient connected for real-time health data");

  const healthDataHistory = [];
  const historySize = 10;
  const windowSize = 5;

  const interval = setInterval(() => {
    const heartbeat = Math.floor(Math.random() * (120 - 60 + 1)) + 60;
    const spo2 = Math.floor(Math.random() * (100 - 90 + 1)) + 90;

    const healthDataPoint = {
      heartbeat: heartbeat,
      spo2: spo2,
      recordedAt: new Date(),
    };

    healthDataHistory.push(healthDataPoint);
    if (healthDataHistory.length > historySize) {
      healthDataHistory.shift();
    }

    // Anomaly Detection Logic
    let anomaly = {
      isAnomalous: false,
      severity: "Low", // Default severity
      message: "",
    };

    if (healthDataHistory.length >= windowSize) {
      // Extract heartbeat and spo2 values from history
      const heartbeatValues = healthDataHistory.map((data) => data.heartbeat);
      const spo2Values = healthDataHistory.map((data) => data.spo2);

      // Calculate moving averages
      const avgHeartbeat = calculateMovingAverage(heartbeatValues, windowSize);
      const avgSpo2 = calculateMovingAverage(spo2Values, windowSize);

      // Calculate standard deviations
      const stdDevHeartbeat = calculateStandardDeviation(
        heartbeatValues,
        avgHeartbeat,
      );
      const stdDevSpo2 = calculateStandardDeviation(spo2Values, avgSpo2);

      if (avgHeartbeat !== null && stdDevHeartbeat !== null) {
        const heartbeatThreshold = stdDevHeartbeat * 2; // 2 standard deviations
        const heartbeatDeviation = Math.abs(heartbeat - avgHeartbeat);

        if (heartbeatDeviation > heartbeatThreshold) {
          anomaly.isAnomalous = true;
          anomaly.message = `Heart Rate anomaly detected. Current: ${heartbeat} bpm, Avg: ${avgHeartbeat} bpm`;

          // Severity Level
          if (heartbeatDeviation > heartbeatThreshold * 2) {
            anomaly.severity = "High";
            anomaly.message += " - HIGH Severity";
          } else if (heartbeatDeviation > heartbeatThreshold) {
            anomaly.severity = "Medium";
            anomaly.message += " - MEDIUM Severity";
          }
        }
      }

      if (avgSpo2 !== null && stdDevSpo2 !== null) {
        const spo2Threshold = stdDevSpo2 * 2; // 2 standard deviations
        const spo2Deviation = Math.abs(spo2 - avgSpo2);

        if (spo2Deviation > spo2Threshold) {
          anomaly.isAnomalous = true;
          anomaly.message += `\nSpO2 anomaly detected. Current: ${spo2}%, Avg: ${avgSpo2}%`;

          // Severity Level
          if (spo2Deviation > spo2Threshold * 2) {
            anomaly.severity = "High";
            anomaly.message += " - HIGH Severity";
          } else if (spo2Deviation > spo2Threshold) {
            anomaly.severity = "Medium";
            anomaly.message += " - MEDIUM Severity";
          }
        }
      }
    }

    // Generate recommendations
    const recommendations = generateRecommendations(healthDataPoint, anomaly);

    // Calculate risk level based on heartbeat and spo2
    let riskLevel = "Normal";
    if (heartbeat > 100 || spo2 < 95) {
      riskLevel = "Alert";
    }

    const mockData = {
      heartbeat: heartbeat,
      spo2: spo2,
      recordedAt: new Date(),
      riskLevel: riskLevel,
      isAnomalous: anomaly.isAnomalous,
      anomalySeverity: anomaly.severity,
      anomalyMessage: anomaly.message,
      recommendations: recommendations, // Add recommendations to the data
    };
    console.log("Sending mock data:", mockData);
    ws.send(JSON.stringify(mockData));
  }, 10000);

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    clearInterval(interval);
  });
});

// Get specific patient’s health data (for doctors)
router.get("/doctor/patient/:patientCode/health-data", async (req, res) => {
  try {
    const { patientCode } = req.params;
    const patient = await Patient.findOne({ patientCode });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ healthData: patient.healthData });
  } catch (error) {
    console.error("Error fetching patient's health data:", error);
    return res.status(500).json({
      message: "Error fetching patient's health data",
      error: error.message,
    });
  }
});

// 👤 GET: Patient fetches their own health data
router.get("/patient/health-data", async (req, res) => {
  try {
    const patient = await Patient.findById(req.query.patientId); // Use query parameter for patient ID
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ healthData: patient.healthData });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch health data", error: err.message });
  }
});

// 👤 POST: Patient adds their own health data
router.post("/patient/health-data", async (req, res) => {
  try {
    const patient = await Patient.findById(req.body.patientId); // Use body parameter for patient ID
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const { heartbeat, diseases } = req.body;

    patient.healthData.push({ heartbeat, diseases });
    await patient.save();

    res.status(201).json({ message: "Health data added successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add health data", error: err.message });
  }
});

// Patient requests an appointment with an assigned doctor
router.post("/appointments/request", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "patient")
      return res
        .status(403)
        .json({ message: "Only patients can request appointments" });

    const { doctorId, date, reason } = req.body;
    const patient = await Patient.findById(req.user.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Check doctor is assigned to this patient
    if (!patient.doctorCodes.map(String).includes(doctorId))
      return res
        .status(403)
        .json({ message: "Doctor not assigned to this patient" });

    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctorId,
      date,
      reason,
    });
    await appointment.save();
    res.status(201).json({ message: "Appointment requested", appointment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to request appointment", error: err.message });
  }
});

// Patient views their appointments
router.get("/appointments/patient", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "patient")
      return res
        .status(403)
        .json({ message: "Only patients can view their appointments" });

    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name doctorCode specialty")
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: err.message });
  }
});

// Doctor views their appointments
router.get("/appointments/doctor", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res
        .status(403)
        .json({ message: "Only doctors can view their appointments" });

    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name patientCode")
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: err.message });
  }
});

// Doctor accepts/rejects appointment
router.patch("/appointments/:id/status", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res
        .status(403)
        .json({ message: "Only doctors can update appointments" });

    const { status } = req.body;
    if (!["confirmed", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your appointment" });

    appointment.status = status;
    await appointment.save();
    res.json({ message: "Appointment updated", appointment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update appointment", error: err.message });
  }
});

// Patient cancels appointment
router.patch("/appointments/:id/cancel", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "patient")
      return res
        .status(403)
        .json({ message: "Only patients can cancel appointments" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patient.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your appointment" });

    appointment.status = "cancelled";
    await appointment.save();
    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to cancel appointment", error: err.message });
  }
});

module.exports = router;
