// utils/api.js
import axios from 'axios';
import { getToken, saveToken } from './storage';
// utils/api.js
const API_URL =
  "https://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/";

// Authenticated API instance
const authAPI = axios.create({
  baseURL: API_URL,
});

// Dynamically add token from AsyncStorage
authAPI.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log("Token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}api/auth/login`, userData);
    await saveToken(response.data.token);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
// Register Function (for both Doctor and Patient)
export const registerUser = async (userData, role) => {
  try {
    const response = await axios.post(
      `${API_URL}api/auth/register/${role}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}; // ✅ New: Get Profile Info (requires token)
export const getUserProfile = async () => {
  try {
    const response = await authAPI.get("api/auth/profile");
    console.log("Raw Profile Response:", response.data); // Log raw response
    return response.data; // Return the entire response data
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// 🩺 Add Health Data (Patient)
export const addHealthData = async (data) => {
  try {
    const response = await authAPI.post("api/patient/health-data", data);
    return response.data;
  } catch (error) {
    console.error("Error adding health data:", error);
    throw error;
  }
};

// 📈 Get Patient's Own Health Data
export const getMyHealthData = async () => {
  try {
    const response = await authAPI.get("api/patient/health-data");
    return response.data;
  } catch (error) {
    console.error("Error getting health data:", error);
    throw error;
  }
};

export const getPatientHealthData = async (patientCode) => {
  try {
    const response = await authAPI.get(
      `api/doctor/patient/${patientCode}/health-data`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting patient health data:", error);
    throw error;
  }
};

export const assignPatient = async ({ doctorCode, patientCode }) => {
  const response = await authAPI.post("api/auth/assign-patient", {
    doctorCode,
    patientCode,
  });
  return response.data;
};

export const getDoctorPatients = async () => {
  const response = await authAPI.get("api/auth/doctor/patients");
  // response.data IS the array
  return response.data;
};

export const requestAppointment = async ({ doctorId, date, reason }) => {
  const response = await authAPI.post("api/appointments/request", {
    doctorId,
    date,
    reason,
  });
  return response.data;
};

export const getPatientAppointments = async () => {
  const response = await authAPI.get("api/appointments/patient");
  return response.data;
};

export const getDoctorAppointments = async () => {
  try {
    const response = await authAPI.get("api/appointments/doctor");
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
};
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await authAPI.patch(`api/appointments/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

export const cancelAppointment = async (id) => {
  try {
    const response = await authAPI.patch(`api/appointments/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

export const setCustomRecommendations = async (patientCode, recommendations) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/doctor/patient/${patientCode}/custom-recommendations`,
      { recommendations }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error setting custom recommendations for patient:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};