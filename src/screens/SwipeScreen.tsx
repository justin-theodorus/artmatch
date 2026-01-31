import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated'
import SwipeCard from '../components/SwipeCard'
import { Artwork } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/styles'
import { recommendationAPI, artworkAPI } from '../services/api'
import { useUserStore } from '../store/userStore'
import { HeartPop, Shimmer, Floating } from '../components/animations'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function SwipeScreen ({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showHeartPop, setShowHeartPop] = useState(false)
  const user = useUserStore((state) => state.user)

  // Button animation values
  const passButtonScale = useSharedValue(1)
  const likeButtonScale = useSharedValue(1)
  
  useEffect(() => {
    loadArtworks()
  }, [user?.id])
  
  const loadArtworks = async () => {
    try {
      setLoading(true)
      // Use personalized recommendations if user exists, otherwise use popular
      if (user?.id) {
        const data = await recommendationAPI.getRecommendations(user.id, 20)
        setArtworks(data)
      } else {
        const data = await recommendationAPI.getPopular(20)
        setArtworks(data)
      }
    } catch (error) {
      console.error('Error loading artworks:', error)
      // Fallback to popular if recommendations fail
      try {
        const data = await recommendationAPI.getPopular(20)
        setArtworks(data)
      } catch (e) {
        console.error('Error loading popular artworks:', e)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleSwipeLeft = async () => {
    const artwork = artworks[currentIndex]
    if (artwork && user) {
      try {
        await artworkAPI.recordSwipe(user.id, artwork.id, 'pass')
      } catch (error) {
        console.error('Error recording pass:', error)
      }
    }
    
    setCurrentIndex((prev) => prev + 1)
    
    // Load more artworks when running low
    if (currentIndex >= artworks.length - 3) {
      loadMoreArtworks()
    }
  }
  
  const handleSwipeRight = async () => {
    const artwork = artworks[currentIndex]
    if (artwork && user) {
      try {
        await artworkAPI.recordSwipe(user.id, artwork.id, 'like')
      } catch (error) {
        console.error('Error recording like:', error)
      }
    }
    
    setCurrentIndex((prev) => prev + 1)
    
    // Load more artworks when running low
    if (currentIndex >= artworks.length - 3) {
      loadMoreArtworks()
    }
  }
  
  const loadMoreArtworks = async () => {
    try {
      const existingIds = artworks.map(a => a.id)
      // Use personalized recommendations with exclusion list
      if (user?.id) {
        const newArtworks = await recommendationAPI.getRecommendations(user.id, 10, existingIds)
        setArtworks([...artworks, ...newArtworks])
      } else {
        const newArtworks = await recommendationAPI.getPopular(10)
        const filtered = newArtworks.filter(a => !existingIds.includes(a.id))
        setArtworks([...artworks, ...filtered])
      }
    } catch (error) {
      console.error('Error loading more artworks:', error)
    }
  }
  
  const handleCardPress = () => {
    const artwork = artworks[currentIndex]
    if (artwork) {
      navigation.navigate('ArtworkDetail', { artworkId: artwork.id })
    }
  }
  
  const handlePassButton = useCallback(() => {
    // Subtle scale animation
    passButtonScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 150 })
    )
    handleSwipeLeft()
  }, [handleSwipeLeft])

  const handleLikeButton = useCallback(() => {
    // Subtle scale animation
    likeButtonScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 150 })
    )
    // Show heart pop animation
    setShowHeartPop(true)
    setTimeout(() => setShowHeartPop(false), 800)
    handleSwipeRight()
  }, [handleSwipeRight])

  // Animated styles for buttons (subtle scale only)
  const passButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passButtonScale.value }],
  }))

  const likeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeButtonScale.value }],
  }))

  if (loading) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.centerContainer}
      >
        <View style={styles.loadingCard}>
          <Shimmer width="100%" height={300} borderRadius={16} />
          <View style={styles.loadingCardInfo}>
            <Shimmer width="70%" height={24} borderRadius={8} />
            <Shimmer width="50%" height={18} borderRadius={8} style={{ marginTop: 12 }} />
            <Shimmer width="30%" height={20} borderRadius={8} style={{ marginTop: 12 }} />
          </View>
        </View>
        <Text style={styles.loadingText}>Discovering art for you...</Text>
      </Animated.View>
    )
  }

  if (currentIndex >= artworks.length) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.centerContainer}
      >
        <Floating>
          <Text style={styles.emptyEmoji}>🎨</Text>
        </Floating>
        <Text style={styles.emptyTitle}>You've seen it all!</Text>
        <Text style={styles.emptySubtitle}>Check back later for fresh artworks</Text>
        <AnimatedPressable
          entering={FadeInUp.delay(100).duration(250)}
          style={styles.reloadButton}
          onPress={loadArtworks}
        >
          <Text style={styles.reloadButtonText}>Discover More</Text>
        </AnimatedPressable>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Heart pop animation */}
      <HeartPop visible={showHeartPop} />

      {/* Card stack */}
      <View style={styles.cardContainer}>
        {artworks.slice(currentIndex, currentIndex + 3).map((artwork, index) => (
          <SwipeCard
            key={artwork.id}
            artwork={artwork}
            onSwipeLeft={index === 0 ? handleSwipeLeft : () => {}}
            onSwipeRight={index === 0 ? handleSwipeRight : () => {}}
            onPress={handleCardPress}
            isTop={index === 0}
            topOffset={insets.top + SPACING.sm}
          />
        ))}
      </View>

      {/* Action buttons */}
      <Animated.View
        entering={FadeIn.delay(200).duration(250)}
        style={styles.actions}
      >
        <AnimatedPressable
          style={[styles.button, styles.passButton, passButtonAnimatedStyle]}
          onPress={handlePassButton}
        >
          <Text style={styles.passButtonIcon}>✕</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[styles.button, styles.likeButton, likeButtonAnimatedStyle]}
          onPress={handleLikeButton}
        >
          <Text style={styles.likeButtonIcon}>♥</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.lg
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg
  },
  passButton: {
    backgroundColor: COLORS.background,
    borderWidth: 3,
    borderColor: COLORS.error
  },
  likeButton: {
    backgroundColor: COLORS.success,
    ...SHADOWS.colored(COLORS.success)
  },
  passButtonIcon: {
    fontSize: 32,
    color: COLORS.error,
    fontWeight: '700'
  },
  likeButtonIcon: {
    fontSize: 34,
    color: COLORS.background
  },
  loadingCard: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.lg
  },
  loadingCardInfo: {
    padding: SPACING.lg
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center'
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    ...SHADOWS.colored(COLORS.primary)
  },
  reloadButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600'
  }
})
