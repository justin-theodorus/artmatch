import React, { useState, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Image, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  FadeInLeft,
} from 'react-native-reanimated'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { chatAPI } from '../services/api'
import { useUserStore } from '../store/userStore'
import { Artwork } from '../types'
import { TypingIndicator, ScaleOnPress } from '../components/animations'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  artworks?: Artwork[]
}

export default function ChatScreen ({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI art advisor. I can help you discover artworks that match your taste and budget. What are you looking for today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useUserStore((state) => state.user)
  const flatListRef = useRef<FlatList<Message>>(null)
  
  const suggestedQueries = [
    'Find me abstract art under $2000',
    'Show me colorful contemporary pieces',
    'What would look good in a small bedroom?',
    'I like minimalist art, what do you recommend?'
  ]
  
  const handleSend = async () => {
    if (!input.trim() || !user) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      // Build conversation history for context
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const response = await chatAPI.sendMessage(user.id, input, { history })
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        artworks: response.artworks
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  
  const handleSuggestedQuery = (query: string) => {
    setInput(query)
  }
  
  const handleArtworkPress = (artworkId: string) => {
    navigation.navigate('ArtworkDetail', { artworkId })
  }

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isUser = item.role === 'user'
    const enteringAnimation = isUser
      ? FadeInRight.duration(200)
      : FadeInLeft.duration(200)

    return (
      <Animated.View
        entering={enteringAnimation}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}
      >
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.assistantText
        ]}>
          {item.content}
        </Text>

        {item.artworks && item.artworks.length > 0 && (
          <Animated.ScrollView
            entering={FadeIn.delay(100).duration(200)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.artworkScroll}
          >
            {item.artworks.map((artwork, artworkIndex) => (
              <ScaleOnPress
                key={artwork.id}
                onPress={() => handleArtworkPress(artwork.id)}
                style={styles.artworkCard}
              >
                <Image
                  source={{ uri: artwork.image_url }}
                  style={styles.artworkImage}
                  resizeMode="cover"
                />
                <View style={styles.artworkInfo}>
                  <Text style={styles.artworkTitle} numberOfLines={1}>{artwork.title}</Text>
                  <Text style={styles.artworkPrice}>${artwork.price.toLocaleString()}</Text>
                </View>
              </ScaleOnPress>
            ))}
          </Animated.ScrollView>
        )}
      </Animated.View>
    )
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        extraData={messages.length}
        contentContainerStyle={[styles.messagesContainer, { paddingTop: insets.top + SPACING.md }]}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}
            >
              <TypingIndicator />
            </Animated.View>
          ) : null
        }
      />

      {messages.length === 1 && (
        <Animated.View
          entering={FadeIn.delay(100).duration(250)}
          style={styles.suggestionsContainer}
        >
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          {suggestedQueries.map((query, index) => (
            <AnimatedPressable
              key={index}
              entering={FadeIn.delay(150 + index * 50).duration(200)}
              style={styles.suggestionChip}
              onPress={() => handleSuggestedQuery(query)}
            >
              <Text style={styles.suggestionText}>{query}</Text>
            </AnimatedPressable>
          ))}
        </Animated.View>
      )}

      <Animated.View
        entering={FadeIn.duration(200)}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about artworks..."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={500}
        />
        <AnimatedPressable
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? '...' : '→'}
          </Text>
        </AnimatedPressable>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  messagesContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.lg
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: SPACING.xs,
    ...SHADOWS.sm
  },
  assistantBubble: {
    backgroundColor: COLORS.backgroundLight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: SPACING.xs
  },
  typingBubble: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm
  },
  messageText: {
    ...TYPOGRAPHY.body,
    lineHeight: 22
  },
  userText: {
    color: COLORS.background
  },
  assistantText: {
    color: COLORS.text
  },
  artworkScroll: {
    marginTop: SPACING.md,
    marginHorizontal: -SPACING.xs
  },
  artworkCard: {
    width: 150,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    ...SHADOWS.md
  },
  artworkImage: {
    width: '100%',
    height: 120
  },
  artworkInfo: {
    padding: SPACING.sm
  },
  artworkTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  artworkPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600'
  },
  suggestionsContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  suggestionChip: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm
  },
  suggestionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    maxHeight: 100,
    minHeight: 44
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.colored(COLORS.primary)
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
    shadowOpacity: 0
  },
  sendButtonText: {
    fontSize: 20,
    color: COLORS.background,
    fontWeight: '600'
  }
})
