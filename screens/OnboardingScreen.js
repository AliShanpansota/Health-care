import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import Swiper from "react-native-swiper";
import * as Font from "expo-font";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }) {
  const swiperRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load Fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Montserrat_Regular: require("../assets/fonts/Montserrat-Regular.ttf"),
          Montserrat_Bold: require("../assets/fonts/Montserrat-Bold.ttf"),
          Playfair_Bold: require("../assets/fonts/PlayfairDisplay-Bold.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }

  const slides = [
    {
      title: "Track Your Health",
      subtitle: "Monitor your vitals in real-time with ease.",
      image: "https://cdn-icons-png.flaticon.com/512/4228/4228709.png",
    },
    {
      title: "Stay Connected",
      subtitle: "Connect with doctors and get expert advice.",
      image: "https://cdn-icons-png.flaticon.com/512/4228/4228710.png",
    },
    {
      title: "Achieve Your Goals",
      subtitle: "Set health goals and track your progress.",
      image: "https://cdn-icons-png.flaticon.com/512/4228/4228711.png",
    },
  ];

  return (
    <LinearGradient
      colors={["#0f0f0f", "#1a1a1a"]}
      style={styles.container}
    >
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.pagination}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            {/* Animated Illustration */}
            <Animatable.Image
              animation="fadeInDown"
              delay={200}
              source={{ uri: slide.image }}
              style={styles.illustration}
              resizeMode="contain"
            />

            {/* Title */}
            <Animatable.Text
              animation="fadeInUp"
              delay={400}
              style={styles.title}
            >
              {slide.title}
            </Animatable.Text>

            {/* Subtitle */}
            <Animatable.Text
              animation="fadeInUp"
              delay={600}
              style={styles.subtitle}
            >
              {slide.subtitle}
            </Animatable.Text>
          </View>
        ))}
      </Swiper>

      {/* Get Started Button */}
      <Animatable.View animation="fadeInUp" delay={800} style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("RoleSelection")}
        >
          <LinearGradient
            colors={["#F2994A", "#F2C94C"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  illustration: {
    width: width * 0.7,
    height: height * 0.4,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: "Playfair_Bold", // Simplified font usage
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular", // Simplified font usage
    color: "#ccc",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  dot: {
    backgroundColor: "#555",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#F2994A",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  pagination: {
    bottom: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: width * 0.8,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Montserrat_Bold", // Simplified font usage
    color: "#121212",
  },
});