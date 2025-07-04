const express = require("express");
const expressWs = require("express-ws"); // Import express-ws
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const healthDataRoutes = require("./routes/healthDataRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
expressWs(app); // Initialize WebSocket support
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", healthDataRoutes);

app.use("/api/chatbot", chatbotRoutes);
// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
