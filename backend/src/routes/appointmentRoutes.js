const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const natural = require("natural"); // Import natural
const tokenizer = new natural.WordTokenizer();

require("dotenv").config();

const dialogflow = require("@google-cloud/dialogflow");

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const languageCode = "en-US";

// Function to generate a unique session ID
const generateSessionId = (userId) => {
  return `user-${userId}-${Date.now()}`;
};

// Create a new session client (initialized once)
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your service account key file
});

router.post("/appointments/nlp-request", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id; // Assuming req.user is populated by authMiddleware

    // Generate a unique session ID for each user
    const sessionId = generateSessionId(userId);

    // Define session path
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: languageCode,
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log("Detected intent");
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);

    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);

      if (result.intent.displayName === "GenericAppointmentRequest") {
        const userInput =
          result.parameters.fields.user_input?.stringValue || text; // Use original text if user_input is not available

        // 1. Extract Doctor Name (using NLP)
        let doctorName = await extractDoctorName(userInput);

        // 2. Extract Date (using NLP)
        let appointmentDate = await extractAppointmentDate(userInput);

        // 3. Extract Reason (using NLP)
        let appointmentReason = await extractAppointmentReason(userInput);

        // 4. Suggest Doctor if not found
        let doctor = null;
        let suggestedDoctorName = null;

        if (doctorName) {
          doctor = await Doctor.findOne({
            name: { $regex: new RegExp(`^${doctorName}$`, "i") },
          }); // Case-insensitive exact match
        }

        if (!doctor && doctorName) {
          // Suggest a doctor based on the reason for the appointment
          const suggestedDoctor = await suggestDoctor(appointmentReason);
          if (suggestedDoctor) {
            doctor = suggestedDoctor;
            suggestedDoctorName = suggestedDoctor.name;
          }
        }

        if (!doctor && !doctorName) {
          // Prompt the user to specify a doctor
          return res.status(200).json({
            prompt: "Which doctor would you like to see?",
            requiresDoctor: true,
          });
        }

        if (!doctor) {
          const allDoctors = await Doctor.find({});
          if (allDoctors.length > 0) {
            suggestedDoctorName = allDoctors[0].name;
          }
          return res.status(200).json({
            prompt: `Doctor "${doctorName}" not found. Did you mean Dr. ${suggestedDoctorName}?`,
            requiresDoctor: true,
            suggestedDoctor: suggestedDoctorName, // Replace with actual suggestion
          });
        }

        // 5. Prompt for Date if not found
        if (!appointmentDate) {
          return res.status(200).json({
            prompt: "What date would you like to schedule the appointment?",
            requiresDate: true,
            doctorName: doctor.name,
          });
        }

        // 6. Create the appointment (if all info is available)
        try {
          const appointment = new Appointment({
            patient: userId, // Use the user ID from authentication
            doctor: doctor._id,
            date: new Date(appointmentDate),
            reason: appointmentReason || "Checkup",
          });
          await appointment.save();

          return res.status(200).json({
            message: `Appointment scheduled with ${doctor.name} on ${new Date(
              appointmentDate,
            ).toLocaleDateString()} for ${appointmentReason || "Checkup"}`,
            appointment,
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
          return res
            .status(500)
            .json({ message: "Error saving appointment to the database." });
        }
      }
    } else {
      console.log("  No intent matched.");
      return res.status(200).json({ message: result.fulfillmentText });
    }
  } catch (error) {
    console.error("Dialogflow error:", error);
    return res.status(500).json({ message: "Error processing request" });
  }
});

// Helper Functions (Implement these)
async function extractDoctorName(text) {
  // Use NLP techniques (e.g., Named Entity Recognition) to extract the doctor's name
  // For simplicity, you can use a regular expression or keyword matching
  const doctorRegex = /(Dr\.\s*\w+\s*\w+)|(Doctor\s*\w+\s*\w+)|(\w+\s+(?:MD))/i;
  const match = text.match(doctorRegex);
  return match ? match[0] : null;
}

async function extractAppointmentDate(text) {
  // Use NLP techniques (e.g., Named Entity Recognition) to extract the appointment date
  // For simplicity, you can use a regular expression or keyword matching
  const dateRegex =
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\w+\s*\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)|(today|tomorrow|next week)/i;
  const match = text.match(dateRegex);
  return match ? match[0] : null;
}

async function extractAppointmentReason(text) {
  // Use NLP techniques (e.g., Keyword Extraction) to extract the appointment reason
  const keywords = [
    "checkup",
    "consultation",
    "follow-up",
    "physical",
    "exam",
    "sick",
    "pain",
  ];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const reason = tokens.find((token) => keywords.includes(token));
  return reason || null;
}

async function suggestDoctor(reason) {
  // Suggest a doctor based on the reason for the appointment
  if (reason && reason.toLowerCase().includes("checkup")) {
    return await Doctor.findOne({ specialty: "General Medicine" }); // Example
  } else if (reason && reason.toLowerCase().includes("heart")) {
    return await Doctor.findOne({ specialty: "Cardiology" }); // Example
  }
  return null;
}

module.exports = router;
