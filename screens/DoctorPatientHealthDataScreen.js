import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity, // Import TouchableOpacity
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const { width } = Dimensions.get("window");

const DoctorPatientHealthDataScreen = ({ route }) => {
  const { patientCode } = route.params;
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyHeartRateData, setWeeklyHeartRateData] = useState([]);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [anomalySeverity, setAnomalySeverity] = useState("Low");
  const [anomalyMessage, setAnomalyMessage] = useState("");
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    console.log("Fetching real-time data for patient with code:", patientCode);
    connectWebSocket();
    fetchWeeklyHeartRateData();
    setLoading(false);
  }, [patientCode]);

  const connectWebSocket = () => {
    let ws;
    let reconnectInterval;

   const connect = () => {
      ws = new WebSocket(
        "wss://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/api/patient/health-data-stream"
      );

      ws.onopen = () => {
        clearInterval(reconnectInterval);
        console.log("WebSocket Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setRealTimeData(data);
          setAnomalyDetected(data.isAnomalous);
          setAnomalySeverity(data.anomalySeverity || "Low");
          setAnomalyMessage(data.anomalyMessage || "");
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket Disconnected");
        reconnectInterval = setInterval(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearInterval(reconnectInterval);
    };
  };

  const fetchWeeklyHeartRateData = async () => {
    const today = new Date();
    const lastWeekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      lastWeekData.push({
        date: date.toLocaleDateString(),
        heartbeat: Math.floor(Math.random() * (120 - 60 + 1)) + 60,
      });
    }
    setWeeklyHeartRateData(lastWeekData);
  };

  const getHealthStatus = () => {
    if (!realTimeData) return "Unknown";
    return realTimeData.riskLevel || "Normal";
  };

  const handleChatPress = () => {
    // Navigate to the chat screen, passing the patientCode
    navigation.navigate("ChatScreen", { patientCode: patientCode });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>🩺 Real-Time Health Data for: {patientCode}</Text>

      {/* Anomaly Alert */}
      {anomalyDetected && (
        <View
          style={[
            styles.alertContainer,
            {
              backgroundColor:
                anomalySeverity === "High"
                  ? "#FF4136"
                  : anomalySeverity === "Medium"
                  ? "#FF851B"
                  : "#FFDC00",
            },
          ]}
        >
          <Text style={styles.alertText}>
            ⚠️ Anomaly Detected! ({anomalySeverity})
          </Text>
          <Text style={styles.alertText}>{anomalyMessage}</Text>
        </View>
      )}

      {/* Real-Time Health Data Cards with Icons */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <FontAwesome5
            name="heartbeat"
            size={32}
            color="#F2994A"
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>Heart Rate</Text>
          <Text style={styles.cardValue}>
            {realTimeData ? `${realTimeData.heartbeat} bpm` : "--"}
          </Text>
          <Text style={styles.cardSubtitle}>Real-Time</Text>
        </View>
        <View style={styles.card}>
          <FontAwesome5
            name="lungs"
            size={32}
            color="#56CCF2"
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>SpO₂</Text>
          <Text style={styles.cardValue}>
            {realTimeData ? `${realTimeData.spo2} %` : "--"}
          </Text>
          <Text style={styles.cardSubtitle}>Real-Time</Text>
        </View>
      </View>

      {/* Real-Time Risk Assessment */}
      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.riskAssessmentCard]}>
          <FontAwesome5
            name="exclamation-triangle"
            size={32}
            color={
              getHealthStatus() === "Alert" ? "#e74c3c" : "#27ae60"
            }
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>Risk Assessment</Text>
          <Text style={styles.cardValue}>{getHealthStatus()}</Text>
          <Text style={styles.cardSubtitle}>Real-Time</Text>
          {getHealthStatus() === "Alert" && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={handleChatPress}
            >
              <Text style={styles.chatButtonText}>Chat with Patient</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Weekly Heart Rate Graph */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Weekly Heart Rate</Text>
        {weeklyHeartRateData.length > 0 ? (
          <LineChart
            data={{
              labels: weeklyHeartRateData.map((item) => item.date),
              datasets: [
                {
                  data: weeklyHeartRateData.map((item) => item.heartbeat),
                },
              ],
            }}
            width={width * 0.9}
            height={220}
            chartConfig={{
              backgroundColor: "#1a1a1a",
              backgroundGradientFrom: "#1a1a1a",
              backgroundGradientTo: "#1a1a1a",
              color: (opacity = 1) => `rgba(242, 153, 74, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#F2994A",
              },
            }}
            bezier
            style={styles.graph}
          />
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      {/* Graph Section */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Heart Rate Activity</Text>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: [60, 70, 75, 80, 85, 90, 95],
              },
            ],
          }}
          width={width * 0.9}
          height={220}
          chartConfig={{
            backgroundColor: "#1a1a1a",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            color: (opacity = 1) => `rgba(242, 153, 74, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#F2994A",
            },
          }}
          bezier
          style={styles.graph}
        />
      </View>

      {/* Extra Feature: Last Update */}
      <View style={styles.realTimeContainer}>
        <Text style={styles.realTimeTitle}>Last Update</Text>
        <Text style={styles.realTimeData}>
          {realTimeData
            ? new Date(realTimeData.recordedAt).toLocaleString()
            : "Waiting for data..."}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#fff",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: "Montserrat_Bold",
    color: "#F2994A",
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Montserrat_Regular",
    color: "#ccc",
    marginBottom: 5,
  },
  graphContainer: {
    marginBottom: 20,
  },
  graphTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
    marginBottom: 10,
  },
  graph: {
    borderRadius: 12,
  },
  realTimeContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
  },
  realTimeTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
    marginBottom: 10,
  },
  realTimeData: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#ccc",
    marginBottom: 5,
  },
  noDataText: {
    color: "#fff",
    textAlign: "center",
  },
  alertContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertText: {
    color: "#fff",
    textAlign: "center",
  },
  riskAssessmentCard: {
    // Add styles to adjust the Risk Assessment card if needed
  },
  chatButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
});

export default DoctorPatientHealthDataScreen;