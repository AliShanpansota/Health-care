// components/ChatBubble.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
      <Text style={styles.text}>{message.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  text: {
    color: '#fff',
  },
});
