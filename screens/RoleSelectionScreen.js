import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#0f0f0f", "#1a1a1a"]}
      style={styles.container}
    >
      {/* Title */}
      <Animatable.Text
        animation="fadeInDown"
        delay={200}
        style={styles.title}
      >
        Choose your role below
      </Animatable.Text>

      {/* Patient Role */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate("Login", { role: "patient" })}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2920/2920676.png",
            }}
            style={styles.illustration}
          />
          <Text style={styles.cardTitle}>Patient</Text>
          <Text style={styles.cardSubtitle}>
            Access your health records and connect with doctors.
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Doctor Role */}
      <Animatable.View animation="fadeInUp" delay={600} style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate("Login", { role: "doctor" })}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            }}
            style={styles.illustration}
          />
          <Text style={styles.cardTitle}>Doctor</Text>
          <Text style={styles.cardSubtitle}>
            Manage your patients and provide expert advice.
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "sans-serif",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#1f1f1f",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardContent: {
    alignItems: "center",
  },
  illustration: {
    width: 100,
    height: 100,
    marginBottom: 15,
    tintColor: "#F2994A",
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "sans-serif-medium",
    color: "#fff",
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "sans-serif-light",
    color: "#ccc",
    textAlign: "center",
  },
});