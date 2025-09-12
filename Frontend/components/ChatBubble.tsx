import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ChatMessage } from '@/types';

const { width } = Dimensions.get('window');

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <View style={[styles.container, message.isBot ? styles.botContainer : styles.userContainer]}>
      <View style={[styles.bubble, message.isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.text, message.isBot ? styles.botText : styles.userText]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, message.isBot ? styles.botTimestamp : styles.userTimestamp]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 20,
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  userBubble: {
    backgroundColor: '#DC2626',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 6,
  },
  botText: {
    color: '#374151',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  botTimestamp: {
    color: '#92400E',
  },
  userTimestamp: {
    color: '#FCA5A5',
  },
});