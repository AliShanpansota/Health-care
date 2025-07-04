import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { getToken } from './api/storage';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setMessages(prev => [...prev, newMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const token = await getToken();

      const response = await axios.post(
        "https://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/api/chatbot/chat",
        { message: userInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botReply = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error("Chat Error:", error.message);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Failed to get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.role === "user" ? styles.user : styles.bot]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.chatBox}
          />

          {loading && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginVertical: 10 }}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#888"
              value={userInput}
              onChangeText={setUserInput}
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  chatBox: {
    paddingVertical: 12,
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: "80%",
  },
  user: {
    backgroundColor: "#F2994A",
    alignSelf: "flex-end",
  },
  bot: {
    backgroundColor: "#2c2c2e",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1c1c1e",
    borderTopWidth: 1,
    borderColor: "#2e2e2e",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#2c2c2e",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#F2994A",
    borderRadius: 50,
    padding: 12,
  },
});
