import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const { width } = Dimensions.get("window");

const PatientHealthDataScreen = () => {
  const [realTimeData, setRealTimeData] = useState(null);
  const [weeklyHeartRateData, setWeeklyHeartRateData] = useState([]);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [anomalySeverity, setAnomalySeverity] = useState("Low"); // Default
  const [anomalyMessage, setAnomalyMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]); // State for recommendations

  useEffect(() => {
    connectWebSocket();
    fetchWeeklyHeartRateData();
  }, []);

  const connectWebSocket = () => {
    let ws;
    let reconnectInterval;

    const connect = () => {
      ws = new WebSocket(
        "wss://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/api/patient/health-data-stream"
      );

      ws.onopen = () => {
        clearInterval(reconnectInterval);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setRealTimeData(data);
        setAnomalyDetected(data.isAnomalous);
        setAnomalySeverity(data.anomalySeverity || "Low");
        setAnomalyMessage(data.anomalyMessage || "");
        setRecommendations(data.recommendations || []); // Set recommendations
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = (event) => {
        reconnectInterval = setInterval(connect, 5000);
      };
    };

    connect();

    return () => {
      ws.close();
      clearInterval(reconnectInterval);
    };
  };

  // Function to fetch weekly heart rate data (mock data for now)
  const fetchWeeklyHeartRateData = async () => {
    // Generate mock data for the last 7 days
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Health Reports</Text>

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
        <View style={styles.card}>
          <FontAwesome5
            name="exclamation-triangle"
            size={32}
            color={
              getHealthStatus() === "Alert" ? "#e74c3c" : "#27ae60"
            } // Red if Alert, Green if Normal
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>Risk Assessment</Text>
          <Text style={styles.cardValue}>{getHealthStatus()}</Text>
          <Text style={styles.cardSubtitle}>Real-Time</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>
          🩺 Personalized Recommendations:
        </Text>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.recommendationText}>
              - {recommendation}
            </Text>
          ))
        ) : (
          <Text style={styles.noDataText}>No recommendations at this time.</Text>
        )}
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
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontFamily: "Montserrat_Bold",
    color: "#fff",
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#ccc",
    marginBottom: 5,
  },
});

export default PatientHealthDataScreen;