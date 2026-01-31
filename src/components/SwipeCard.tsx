import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  interpolate,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated'
import { GestureDetector } from 'react-native-gesture-handler'
import { Artwork } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { useSwipeGesture } from '../hooks/useSwipeGesture'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62

interface SwipeCardProps {
  artwork: Artwork
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onPress: () => void
  isTop: boolean
  topOffset?: number
}

export default function SwipeCard ({ artwork, onSwipeLeft, onSwipeRight, onPress, isTop, topOffset = 0 }: SwipeCardProps) {
  const { panGesture, animatedStyle, translateX } = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    screenWidth: SCREEN_WIDTH
  })
  
  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.3],
      [0, 1]
    )
    return { opacity }
  })
  
  const passIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.3, 0],
      [1, 0]
    )
    return { opacity }
  })
  
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          { top: topOffset },
          isTop && animatedStyle
        ]}
      >
        <Pressable onPress={onPress} style={styles.cardContent}>
          <Image
            source={{ uri: artwork.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Like indicator */}
          <Animated.View style={[styles.indicator, styles.likeIndicator, likeIndicatorStyle]}>
            <Text style={styles.indicatorText}>LIKE</Text>
          </Animated.View>
          
          {/* Pass indicator */}
          <Animated.View style={[styles.indicator, styles.passIndicator, passIndicatorStyle]}>
            <Text style={styles.indicatorText}>PASS</Text>
          </Animated.View>
          
          {/* Gradient overlay */}
          <View style={styles.gradient} />
          
          {/* Artwork info */}
          <View style={styles.info}>
            {artwork.explanation && (
              <View style={styles.explanationBadge}>
                <Text style={styles.explanationText}>💡 {artwork.explanation}</Text>
              </View>
            )}
            <Text style={styles.title} numberOfLines={1}>{artwork.title}</Text>
            <Text style={styles.artist}>{artwork.artist}</Text>
            <Text style={styles.price}>${artwork.price.toLocaleString()}</Text>

            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{artwork.style}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{artwork.medium}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - SPACING.lg * 2,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.background,
    ...SHADOWS.xl,
    overflow: 'hidden'
  },
  cardContent: {
    flex: 1
  },
  image: {
    width: '100%',
    height: '100%'
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    // Simulating gradient with a semi-transparent overlay
    // In production, use expo-linear-gradient
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.background,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  artist: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.sm
  },
  price: {
    ...TYPOGRAPHY.h3,
    color: COLORS.background,
    marginBottom: SPACING.md,
    fontWeight: '700'
  },
  tags: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  tagText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  indicator: {
    position: 'absolute',
    top: SPACING.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 4,
    borderRadius: BORDER_RADIUS.lg,
    zIndex: 10
  },
  likeIndicator: {
    right: SPACING.lg,
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    transform: [{ rotate: '15deg' }]
  },
  passIndicator: {
    left: SPACING.lg,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    transform: [{ rotate: '-15deg' }]
  },
  indicatorText: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.background,
    letterSpacing: 2
  },
  explanationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    ...SHADOWS.sm
  },
  explanationText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18
  }
})
