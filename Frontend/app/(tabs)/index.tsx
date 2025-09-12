import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Send, Bot } from 'lucide-react-native';
import ChatBubble from '@/components/ChatBubble';
import { ChatMessage } from '@/types';
import { ChatBotService } from '@/services/chatbot';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 360; // For very small devices

export default function index() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola soy Robo Qhatu! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const chatBot = new ChatBotService();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: chatBot.generateResponse(userMessage.text),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Bot size={isSmallScreen ? 24 : 28} color="#DC2626" />
        </View>
        <Text style={styles.headerTitle}>Asistente Virtual</Text>
        <View style={styles.statusIndicator} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>El asistente está escribiendo...</Text>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 20 : 30, // Extra space for status bar, adjusted for platform
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14.5,  // ← Reducido para pantallas pequeñas
    paddingHorizontal: isSmallScreen ? 16 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },  // ← ELIMINADA LA SOMBRA (era height: 1)
    shadowOpacity: 0,  // ← ELIMINADA LA SOMBRA (era 0.1)
    shadowRadius: 0,   // ← ELIMINADA LA SOMBRA (era 4)
    elevation: 0,      // ← ELIMINADA LA SOMBRA EN ANDROID (era 3)
  },
  headerIconContainer: {
    backgroundColor: '#FEF3C7',
    padding: isSmallScreen ? 6 : 8,  // ← Responsive para pantallas pequeñas
    borderRadius: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,  // ← Responsive para pantallas pequeñas
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    flex: 1,
    textAlign: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    marginLeft: 10,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  typingBubble: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: width * 0.75,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  typingText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: isSmallScreen ? 14 : 16,  // ← Responsive para pantallas pequeñas
    fontFamily: 'Inter-Regular',
    color: '#374151',
    maxHeight: 100,
    marginRight: 16,
    backgroundColor: '#FFFBEB',
  },
  sendButton: {
    backgroundColor: '#DC2626',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});