import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getUserProfile,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  requestAppointment,
  updateAppointmentStatus,
  getDoctorPatients,
} from "./api/api";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();
  const [nlpText, setNlpText] = useState(""); // State for NLP input
  const [nlpResponse, setNlpResponse] = useState(""); // State for NLP response
  const [requiresDoctor, setRequiresDoctor] = useState(false);
  const [requiresDate, setRequiresDate] = useState(false);
  const [suggestedDoctor, setSuggestedDoctor] = useState(null);

  useEffect(() => {
    loadProfile();
    fetchAppointments();
    fetchDoctorsOrPatients();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      console.log("User Profile Response:", userProfile);
      console.log("User Profile Role:", userProfile?.profile?.role);
      setProfile(userProfile?.profile);
      setIsDoctor(userProfile?.profile?.role === "doctor" || false);
    } catch (e) {
      console.error("Error loading profile:", e);
    }
  };

  const fetchDoctorsOrPatients = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile?.profile?.role === "patient") {
        if (!doctors.length) {
          setDoctors(userProfile?.profile?.doctors?.flat() || []);
        }
      } else {
        const pats = await getDoctorPatients();
        setPatients(pats || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const userProfile = await getUserProfile();
      console.log("User Role:", userProfile?.profile?.role);
      setIsDoctor(userProfile?.profile?.role === "doctor");

      const appts =
        userProfile?.profile?.role === "doctor"
          ? await getDoctorAppointments()
          : await getPatientAppointments();

      console.log("Fetched Appointments:", appts);
      setAppointments(appts);
    } catch (e) {
      console.error(
        "Error fetching appointments:",
        e.response?.data || e.message
      );
      if (e.response && e.response.status === 403) {
        Alert.alert(
          "Access Denied",
          "You do not have permission to access this resource."
        );
      } else {
        Alert.alert("Error", "Failed to load appointments.");
      }
    }
    setLoading(false);
  };

  // Patient requests appointment
  const handleRequestAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !reason.trim()) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    try {
      await requestAppointment({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        reason,
      });
      setShowRequestModal(false);
      setReason("");
      fetchAppointments();
      Alert.alert("Requested", "Appointment requested.");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not request appointment."
      );
    }
  };

  // Doctor schedules appointment for patient
  const handleScheduleAppointment = async () => {
    if (!selectedPatient || !selectedDate || !reason.trim()) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    try {
      await requestAppointment({
        doctorId: profile._id,
        date: selectedDate,
        reason,
        patientId: selectedPatient._id,
      });
      setShowScheduleModal(false);
      setReason("");
      fetchAppointments();
      Alert.alert("Scheduled", "Appointment scheduled.");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not schedule appointment."
      );
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
      Alert.alert("Updated", `Appointment ${status}.`);
    } catch (e) {
      Alert.alert("Error", "Could not update appointment.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      fetchAppointments();
      Alert.alert("Cancelled", "Appointment cancelled.");
    } catch (e) {
      Alert.alert("Error", "Could not cancel appointment.");
    }
  };

  // Send NLP request to backend
  const handleNLPSubmit = async () => {
    try {
      const response = await fetch(
        "https://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/api/appointments/nlp-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: nlpText }),
        }
      );

      const data = await response.json();
      setNlpResponse(data.message || data.prompt); // Display the response message
      setRequiresDoctor(data.requiresDoctor || false);
      setRequiresDate(data.requiresDate || false);
      setSuggestedDoctor(data.suggestedDoctor || null);
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error("Error sending NLP request:", error);
      Alert.alert("Error", "Could not process your request.");
    }
  };

  const renderAppointment = ({ item }) => (
    <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
      <LinearGradient
        colors={["#F2994A", "#F2C94C"]}
        style={styles.cardGradient}
      >
        <Ionicons name="calendar-outline" size={32} color="#fff" />
      </LinearGradient>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {isDoctor
            ? item.patient?.name || "Patient"
            : item.doctor?.name || "Doctor"}
        </Text>
        <Text style={styles.cardSubtitle}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <Text style={styles.statusText(item.status)}>
          {item.status.toUpperCase()}
        </Text>
        <Text style={styles.cardSubtitle}>Reason: {item.reason}</Text>
      </View>
      {!isDoctor && item.status === "pending" && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            Alert.alert(
              "Cancel Appointment",
              "Are you sure you want to cancel this appointment?",
              [
                { text: "No" },
                { text: "Yes", onPress: () => handleCancel(item._id) },
              ]
            )
          }
        >
          <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      {isDoctor && item.status === "pending" && (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#27ae60" }]}
            onPress={() => handleUpdateStatus(item._id, "confirmed")}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: "#e74c3c", marginLeft: 8 },
            ]}
            onPress={() => handleUpdateStatus(item._id, "rejected")}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );

  return (
    <LinearGradient colors={["#0f0f0f", "#1a1a1a"]} style={styles.container}>
      <Animatable.Text animation="fadeInDown" style={styles.header}>
        Appointments
      </Animatable.Text>
      {!isDoctor && (
        <View>
          <TextInput
            style={styles.nlpInput}
            placeholder="Schedule an appointment..."
            placeholderTextColor="#aaa"
            value={nlpText}
            onChangeText={setNlpText}
          />
          <TouchableOpacity style={styles.nlpButton} onPress={handleNLPSubmit}>
            <Text style={styles.nlpButtonText}>Submit</Text>
          </TouchableOpacity>
          {nlpResponse ? (
            <Text style={styles.nlpResponseText}>{nlpResponse}</Text>
          ) : null}
          {requiresDoctor && (
            <Text style={styles.nlpResponseText}>
              Please specify which doctor you would like to see.
            </Text>
          )}
          {requiresDate && (
            <Text style={styles.nlpResponseText}>
              Please specify the date you would like to schedule the appointment.
            </Text>
          )}
          {suggestedDoctor && (
            <TouchableOpacity onPress={() => setNlpText(`Book with Dr. ${suggestedDoctor}`)}>
              <Text style={styles.nlpResponseText}>
                Did you mean Dr. {suggestedDoctor}?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!isDoctor && (
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => setShowRequestModal(true)}
        >
          <Text style={styles.requestBtnText}>Request Appointment</Text>
        </TouchableOpacity>
      )}
      {isDoctor && (
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => setShowScheduleModal(true)}
        >
          <Text style={styles.requestBtnText}>Schedule Appointment</Text>
        </TouchableOpacity>
      )}
      {loading ? (
        <ActivityIndicator
          color="#F2994A"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            {isDoctor ? "Your Patients" : "Your Doctors"}
          </Text>
          <FlatList
            data={appointments}
            keyExtractor={(item) => item._id}
            renderItem={renderAppointment}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No appointments available.</Text>
            }
          />
        </>
      )}
      {showRequestModal && (
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="arrow-back" size={24} color="#F2994A" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Request Appointment</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#F2994A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Select Doctor</Text>
              <FlatList
                data={doctors}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      selectedDoctor?._id === item._id &&
                        styles.modalOptionSelected,
                    ]}
                    onPress={() => setSelectedDoctor(item)}
                  >
                    <Text style={{ color: "#fff" }}>
                      {item.name} ({item.doctorCode})
                    </Text>
                  </TouchableOpacity>
                )}
                horizontal
              />

              <Text style={styles.modalLabel}>Select Date</Text>
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "#F2994A",
                  },
                }}
                theme={{
                  backgroundColor: "#333",
                  calendarBackground: "#333",
                  textSectionTitleColor: "#F2994A",
                  selectedDayBackgroundColor: "#F2994A",
                  selectedDayTextColor: "#333",
                  todayTextColor: "#F2994A",
                  dayTextColor: "#fff",
                  textDisabledColor: "#888",
                  arrowColor: "#F2994A",
                  monthTextColor: "#F2994A",
                }}
              />

              <Text style={styles.modalLabel}>Reason</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Reason"
                placeholderTextColor="#aaa"
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#333" }]}
                onPress={() => setShowRequestModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F2994A" }]}
                onPress={handleRequestAppointment}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
      {showScheduleModal && (
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="arrow-back" size={24} color="#F2994A" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Schedule Appointment</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#F2994A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Select Patient</Text>
              <FlatList
                data={patients}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      selectedPatient?._id === item._id &&
                        styles.modalOptionSelected,
                    ]}
                    onPress={() => setSelectedPatient(item)}
                  >
                    <Text style={{ color: "#fff" }}>
                      {item.name} ({item.patientCode})
                    </Text>
                  </TouchableOpacity>
                )}
                horizontal
              />

              <Text style={styles.modalLabel}>Select Date</Text>
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "#F2994A",
                  },
                }}
                theme={{
                  backgroundColor: "#333",
                  calendarBackground: "#333",
                  textSectionTitleColor: "#F2994A",
                  selectedDayBackgroundColor: "#F2994A",
                  selectedDayTextColor: "#333",
                  todayTextColor: "#F2994A",
                  dayTextColor: "#fff",
                  textDisabledColor: "#888",
                  arrowColor: "#F2994A",
                  monthTextColor: "#F2994A",
                }}
              />

              <Text style={styles.modalLabel}>Reason</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Reason"
                placeholderTextColor="#aaa"
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#333" }]}
                onPress={() => setShowScheduleModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F2994A" }]}
                onPress={handleScheduleAppointment}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: {
    fontSize: 28,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_Regular",
    color: "#F2994A",
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_Regular",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat_Regular",
    color: "#ccc",
    marginTop: 2,
  },
  statusText: (status) => ({
    fontSize: 14,
    fontFamily: "Montserrat_Bold",
    color:
      status === "confirmed"
        ? "#27ae60"
        : status === "rejected"
        ? "#e74c3c"
        : status === "cancelled"
        ? "#aaa"
        : "#F2994A",
    marginTop: 2,
  }),
  actionBtn: {
    marginLeft: 10,
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 6,
  },
  emptyText: {
    color: "#888",
    fontFamily: "Montserrat_Regular",
    textAlign: "center",
    marginVertical: 10,
  },
  requestBtn: {
    backgroundColor: "#F2994A",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  requestBtnText: {
    color: "#fff",
    fontFamily: "Montserrat_Bold",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalCard: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontFamily: "Montserrat_Bold",
    fontSize: 20,
    marginBottom: 10,
  },
  modalLabel: {
    color: "#F2994A",
    fontFamily: "Montserrat_Regular",
    marginTop: 10,
    marginBottom: 2,
  },
  modalInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    width: "100%",
  },
  modalOption: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: "#F2994A",
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  modalContent: {
    flex: 1,
    width: "100%",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_Bold",
    fontSize: 16,
  },
  timeSlotsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  scheduleTitle: {
    color: "#F2994A",
    fontFamily: "Montserrat_Medium",
    fontSize: 16,
    marginBottom: 5,
  },
  timeSlotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeSlotButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeSlotText: {
    color: "#fff",
    fontFamily: "Montserrat_Regular",
    fontSize: 14,
  },
  selectedTimeSlot: {
    backgroundColor: "#F2994A",
  },
  nlpInput: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
  },
  nlpButton: {
    backgroundColor: "#F2994A",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  nlpButtonText: {
    color: "#121212",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Montserrat_Bold",
  },
  nlpResponseText: {
    color: "#ccc",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    marginTop: 10,
    textAlign: "center",
  },
});

export default AppointmentsScreen;