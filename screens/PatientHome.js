import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const PatientHome = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#0f0f0f", "#1a1a1a"]}
      style={styles.container}
    >
      {/* Header Section */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.highlight}>Patient</Text>!
        </Text>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={50} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>

      {/* Cards Section */}
      <Animatable.View animation="fadeInUp" delay={300} style={styles.cards}>
        {/* Health Data Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PatientHealthDataScreen")}
        >
          <LinearGradient
            colors={["#F2994A", "#F2C94C"]}
            style={styles.cardGradient}
          >
            <Ionicons name="heart-outline" size={40} color="#fff" />
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Health Data</Text>
            <Text style={styles.cardSubtitle}>
              Track your heartbeat and SpO2
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={30}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Appointments Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Appointments")}
        >
          <LinearGradient
            colors={["#6A11CB", "#2575FC"]}
            style={styles.cardGradient}
          >
            <Ionicons name="calendar-outline" size={40} color="#fff" />
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

         <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Chat")}
        >
          <LinearGradient
            colors={["#6A11CB", "#2575FC"]}
            style={styles.cardGradient}
          >
            <Ionicons name="calendar-outline" size={40} color="#fff" />
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Ai Chat</Text>
            <Text style={styles.cardSubtitle}>
               go to chat with ai
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
};

export default PatientHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: "Poppins-Bold", // Use a custom font
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
    fontFamily: "Poppins-SemiBold", // Use a custom font
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Use a custom font
    color: "#ccc",
    marginTop: 4,
  },
});