import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import MapView, { Marker } from 'react-native-maps'
import { Gallery } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { galleryAPI } from '../services/api'
import { useUserStore } from '../store/userStore'
import { Shimmer, ScaleOnPress, AnimatedProgressBar, StaggeredItem } from '../components/animations'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface RecommendedGallery extends Gallery {
  recommendation_reason?: string
}

export default function GalleryScreen ({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [recommendedGalleries, setRecommendedGalleries] = useState<RecommendedGallery[]>([])
  const [hasEnoughLikes, setHasEnoughLikes] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    loadGalleries()
    if (user?.id) {
      loadRecommendedGalleries()
    }
  }, [user?.id])
  
  const loadGalleries = async () => {
    try {
      setLoading(true)
      const data = await galleryAPI.getGalleries()
      setGalleries(data)
    } catch (error) {
      console.error('Error loading galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendedGalleries = async () => {
    if (!user?.id) return
    try {
      const data = await galleryAPI.getRecommendedGalleries(user.id)
      setHasEnoughLikes(data.has_enough_likes)
      setLikesCount(data.likes_count)
      setRecommendedGalleries(data.galleries)
    } catch (error) {
      console.error('Error loading recommended galleries:', error)
    }
  }
  
  const handleGalleryPress = (gallery: Gallery) => {
    navigation.navigate('GalleryProfile', { galleryId: gallery.id })
  }
  
  const handleGetDirections = (gallery: Gallery) => {
    const url = `https://maps.apple.com/?daddr=${gallery.latitude},${gallery.longitude}`
    Linking.openURL(url)
  }
  
  const renderGalleryCard = ({ item }: { item: Gallery }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleGalleryPress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.galleryName}>{item.name}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.galleryAddress} numberOfLines={2}>{item.address}</Text>
        {item.opening_hours && (
          <Text style={styles.openingHours}>{item.opening_hours}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.directionsButton}
        onPress={() => handleGetDirections(item)}
      >
        <Text style={styles.directionsText}>Directions</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
  
  if (loading) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <View style={[styles.toggleContainer, { paddingTop: insets.top + SPACING.sm }]}>
          <View style={styles.toggleButton}><Shimmer width={40} height={18} borderRadius={8} /></View>
          <View style={styles.toggleButton}><Shimmer width={40} height={18} borderRadius={8} /></View>
        </View>
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.card}>
              <Shimmer width="60%" height={22} borderRadius={8} />
              <Shimmer width="80%" height={16} borderRadius={6} style={{ marginTop: 12 }} />
              <Shimmer width={100} height={36} borderRadius={8} style={{ marginTop: 16 }} />
            </View>
          ))}
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.toggleContainer, { paddingTop: insets.top + SPACING.sm }]}
      >
        <AnimatedPressable
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            📋 List
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            🗺️ Map
          </Text>
        </AnimatedPressable>
      </Animated.View>
      
      {viewMode === 'list' ? (
        <Animated.ScrollView
          entering={FadeIn.duration(300)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Recommended Galleries Section */}
          {hasEnoughLikes && recommendedGalleries.length > 0 && (
            <Animated.View entering={FadeIn.duration(250)} style={styles.recommendedSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>✨</Text>
                <View>
                  <Text style={styles.sectionTitle}>Recommended For You</Text>
                  <Text style={styles.sectionSubtitle}>Based on {likesCount} artworks you liked</Text>
                </View>
              </View>
              {recommendedGalleries.map((gallery, index) => (
                <StaggeredItem key={gallery.id} index={index}>
                  <ScaleOnPress
                    onPress={() => handleGalleryPress(gallery)}
                    style={[styles.card, styles.recommendedCard]}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.galleryName}>{gallery.name}</Text>
                        {gallery.verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                          </View>
                        )}
                      </View>
                      {gallery.recommendation_reason && (
                        <View style={styles.reasonBadge}>
                          <Text style={styles.reasonText}>💡 {gallery.recommendation_reason}</Text>
                        </View>
                      )}
                      <Text style={styles.galleryAddress} numberOfLines={2}>{gallery.address}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => handleGetDirections(gallery)}
                    >
                      <Text style={styles.directionsText}>Directions →</Text>
                    </TouchableOpacity>
                  </ScaleOnPress>
                </StaggeredItem>
              ))}
            </Animated.View>
          )}

          {/* Not enough likes message */}
          {!hasEnoughLikes && likesCount > 0 && (
            <Animated.View entering={FadeIn.duration(250)} style={styles.notEnoughLikesContainer}>
              <Text style={styles.notEnoughLikesEmoji}>🎯</Text>
              <Text style={styles.notEnoughLikesTitle}>Keep discovering!</Text>
              <Text style={styles.notEnoughLikesText}>
                Like {5 - likesCount} more artwork{5 - likesCount !== 1 ? 's' : ''} to unlock personalized gallery recommendations
              </Text>
              <AnimatedProgressBar
                progress={likesCount / 5}
                height={8}
                backgroundColor={COLORS.border}
                fillColor={COLORS.primary}
                style={styles.progressBarStyle}
              />
            </Animated.View>
          )}

          {/* All Galleries Section */}
          <Animated.View entering={FadeIn.delay(100).duration(250)} style={styles.allGalleriesSection}>
            <Text style={styles.sectionTitle}>All Galleries</Text>
            {galleries.map((gallery, index) => (
              <StaggeredItem key={gallery.id} index={index}>
                <ScaleOnPress
                  onPress={() => handleGalleryPress(gallery)}
                  style={styles.card}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.galleryName}>{gallery.name}</Text>
                      {gallery.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.galleryAddress} numberOfLines={2}>{gallery.address}</Text>
                    {gallery.opening_hours && (
                      <View style={styles.openingHoursContainer}>
                        <Text style={styles.openingHoursIcon}>🕐</Text>
                        <Text style={styles.openingHours}>{gallery.opening_hours}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => handleGetDirections(gallery)}
                  >
                    <Text style={styles.directionsText}>Directions →</Text>
                  </TouchableOpacity>
                </ScaleOnPress>
              </StaggeredItem>
            ))}
          </Animated.View>
        </Animated.ScrollView>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 1.2902,
            longitude: 103.8519,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }}
        >
          {galleries.map((gallery) => (
            <Marker
              key={gallery.id}
              coordinate={{
                latitude: gallery.latitude,
                longitude: gallery.longitude
              }}
              title={gallery.name}
              description={gallery.address}
              onCalloutPress={() => handleGalleryPress(gallery)}
            />
          ))}
        </MapView>
      )}
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
    backgroundColor: COLORS.backgroundLight
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.background
  },
  toggleButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.colored(COLORS.primary)
  },
  toggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  toggleTextActive: {
    color: COLORS.background
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  cardContent: {
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  galleryName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1
  },
  verifiedBadge: {
    backgroundColor: COLORS.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm
  },
  verifiedText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700'
  },
  galleryAddress: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 22
  },
  openingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  openingHoursIcon: {
    fontSize: 14
  },
  openingHours: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textLight
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    ...SHADOWS.colored(COLORS.primary)
  },
  directionsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600'
  },
  map: {
    flex: 1
  },
  recommendedSection: {
    marginBottom: SPACING.xl
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  sectionEmoji: {
    fontSize: 28
  },
  allGalleriesSection: {
    marginTop: SPACING.md
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary
  },
  recommendedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.primaryGhost
  },
  reasonBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start'
  },
  reasonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontWeight: '600'
  },
  notEnoughLikesContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md
  },
  notEnoughLikesEmoji: {
    fontSize: 40,
    marginBottom: SPACING.md
  },
  notEnoughLikesTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  notEnoughLikesText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22
  },
  progressBarStyle: {
    width: '100%'
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4
  }
})
