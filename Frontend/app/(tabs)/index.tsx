import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChatBubble from '@/components/ChatBubble';
import { ChatMessage } from '@/types';
import { ChatBotService } from '@/services/chatbot';

const { width, height } = Dimensions.get('window');
const chatBot = new ChatBotService();

// Componente separado para los dots animados
const TypingDot = ({ delay }: { delay: number }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.typingDot,
        {
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy Robo Qhatu, tu asistente virtual del minimarket. ¿En qué puedo ayudarte hoy? Puedo ayudarte con información de productos, precios, stock y más.',
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

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
      
      // Scroll to bottom after bot response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  useEffect(() => {
    if (messages.length > 1) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}
    >
      <ChatBubble message={item} />
    </Animated.View>
  );

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingContent}>
          <View style={styles.typingDots}>
            <TypingDot delay={0} />
            <TypingDot delay={200} />
            <TypingDot delay={400} />
          </View>
          <Text style={styles.typingText}>Robo Qhatu está escribiendo...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFBEB']}
        style={styles.headerGradient}
      >
        <View style={styles.statusBarSpacer} />
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Qhatu Marca App</Text>
            <Text style={styles.headerTitle}>Asistente Virtual</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.headerIconContainer}>
              <Ionicons name="information-circle-outline" size={22} color="#5D4037" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Background Pattern */}
        <LinearGradient
          colors={['#FFFBEB', '#FFF3E0']}
          style={styles.chatBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.patternOverlay} />
        </LinearGradient>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.welcomeContainer}>
             
            </View>
          }
        />

        {isTyping && <TypingIndicator />}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#9E9E9E"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
            <Pressable 
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendButtonPressed,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#FFC107', '#FF9800'] : ['#E0E0E0', '#BDBDBD']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContent}
            >
              {[
                '¿Qué productos tienen oferta?',
                'Horario de atención',
                'Productos más vendidos',
                'Consultar precios'
              ].map((action, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    pressed && styles.quickActionPressed
                  ]}
                  onPress={() => setInputText(action)}
                >
                  <Text style={styles.quickActionText}>{action}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
    height: Platform.OS === 'ios' ? 44 : 30,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 193, 7, 0.03)',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeGradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeIcon: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: width * 0.7,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#5D4037',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFE0B2',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: '#5D4037',
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#FFFBEB',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  quickActions: {
    paddingHorizontal: 16,
  },
  quickActionsContent: {
    paddingHorizontal: 4,
  },
  quickActionButton: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  quickActionPressed: {
    backgroundColor: '#FFE0B2',
    transform: [{ scale: 0.98 }],
  },
  quickActionText: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '500',
  },
});