import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  getDoctorPatients,
  assignPatient,
  getUserProfile,
} from "./api/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const DoctorHome = () => {
  const navigation = useNavigation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await getUserProfile();
        setProfile(me);

        const list = await getDoctorPatients();
        setPatients(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAssign = async () => {
    if (!newCode.trim()) {
      return Alert.alert("Error", "Enter a patient code first");
    }
    if (!profile) {
      return Alert.alert("Error", "Profile not loaded");
    }

    setAssigning(true);
    try {
      await assignPatient({
        doctorCode: profile.doctorCode,
        patientCode: newCode.trim().toUpperCase(),
      });
      Alert.alert("Success", `Assigned ${newCode} to you`);
      setNewCode("");

      const updated = await getDoctorPatients();
      setPatients(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Assign Failed",
        err.response?.data?.message || err.message
      );
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0f0f0f", "#1a1a1a"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome,{" "}
            <Text style={styles.highlight}>{profile?.name || "Doctor"}</Text>!
          </Text>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-circle-outline" size={50} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Assigned Patients Section */}
        <View style={styles.cards}>
          {patients.length > 0 ? (
            patients.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("DoctorPatientHealthDataScreen", {
                    patientCode: p.patientCode,
                  })
                }
              >
                <LinearGradient
                  colors={["#F2994A", "#F2C94C"]}
                  style={styles.cardGradient}
                >
                  
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{p.name.toUpperCase()}</Text>
                 
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noPatientsText}>No patients available.</Text>
          )}

          {/* Assign Patient Section */}
          <View style={styles.assignContainer}>
            <Text style={styles.label}>Assign Patient</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Patient Code (e.g. PAT005)"
              placeholderTextColor="#aaa"
              value={newCode}
              onChangeText={setNewCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.assignButton, assigning && styles.buttonDisabled]}
              onPress={handleAssign}
              disabled={assigning}
            >
              <Text style={styles.assignText}>
                {assigning ? "Assigning…" : "Assign Patient"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Appointments Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Appointments")}
          >
            <LinearGradient
              colors={["#6A11CB", "#2575FC"]}
              style={styles.cardGradient}
            >
          
            </LinearGradient>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Appointments</Text>
              <Text style={styles.cardSubtitle}>
                View and manage your appointments
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default DoctorHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
  },
  highlight: {
    color: "#F2994A",
  },
  profileIcon: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 30,
  },
  cards: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginTop:20
  },
  cardGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat_Regular",
    color: "#ccc",
    marginTop: 4,
  },
  noPatientsText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  assignContainer: {
    marginTop: 30,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
  input: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
  },
  assignButton: {
    backgroundColor: "#F2994A",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  assignText: {
    color: "#121212",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Montserrat_Bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  cardGradient: {
    borderRadius: 8,
    alignItems: "center",
  },
  cardTitle: {
    color: "#F2994A",
    fontFamily: "Montserrat_Bold",
    fontSize: 18,
    textAlign: "center",
  },
});