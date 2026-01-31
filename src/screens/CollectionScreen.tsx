import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { Artwork } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { artworkAPI } from '../services/api'
import { useUserStore } from '../store/userStore'
import { Shimmer, Floating, ScaleOnPress, StaggeredItem } from '../components/animations'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function CollectionScreen ({ navigation }: any) {
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUserStore((state) => state.user)
  
  useEffect(() => {
    if (user) {
      loadLikedArtworks()
    }
  }, [user])
  
  const loadLikedArtworks = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const artworks = await artworkAPI.getUserLikes(user.id)
      setLikedArtworks(artworks)
    } catch (error) {
      console.error('Error loading liked artworks:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const calculateTotalValue = () => {
    return likedArtworks.reduce((sum, artwork) => sum + artwork.price, 0)
  }
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }
  
  const getStyleBreakdown = () => {
    const styleCounts: Record<string, number> = {}
    likedArtworks.forEach(artwork => {
      styleCounts[artwork.style] = (styleCounts[artwork.style] || 0) + 1
    })
    return styleCounts
  }
  
  const renderArtworkItem = ({ item, index }: { item: Artwork, index: number }) => (
    <StaggeredItem index={index} style={styles.artworkCardWrapper}>
      <ScaleOnPress
        onPress={() => navigation.navigate('ArtworkDetail', { artworkId: item.id })}
        style={styles.artworkCard}
      >
        <Image source={{ uri: item.image_url }} style={styles.artworkImage} resizeMode="cover" />
        <View style={styles.artworkInfo}>
          <Text style={styles.artworkTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.artworkArtist} numberOfLines={1}>{item.artist}</Text>
          <Text style={styles.artworkPrice}>${item.price.toLocaleString()}</Text>
        </View>
      </ScaleOnPress>
    </StaggeredItem>
  )

  if (loading) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <View style={styles.stats}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.statCard}>
              <Shimmer width={50} height={32} borderRadius={8} />
              <Shimmer width={60} height={14} borderRadius={6} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
        <View style={styles.artworksSection}>
          <Shimmer width={120} height={24} borderRadius={8} style={{ marginBottom: SPACING.md }} />
          <View style={styles.artworksRow}>
            <Shimmer width="48%" height={200} borderRadius={12} />
            <Shimmer width="48%" height={200} borderRadius={12} />
          </View>
        </View>
      </Animated.View>
    )
  }

  if (likedArtworks.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.centerContainer}>
        <Floating>
          <Text style={styles.emptyEmoji}>💝</Text>
        </Floating>
        <Text style={styles.emptyTitle}>Your collection awaits</Text>
        <Text style={styles.emptySubtitle}>Like artworks to start building your personal gallery</Text>
      </Animated.View>
    )
  }
  
  const totalValue = calculateTotalValue()
  const styleBreakdown = getStyleBreakdown()
  const topStyles = Object.entries(styleBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(50).duration(250)} style={styles.stats}>
        <Animated.View entering={FadeIn.delay(80).duration(200)} style={[styles.statCard, styles.statCardFirst]}>
          <Text style={styles.statValue}>{likedArtworks.length}</Text>
          <Text style={styles.statLabel}>Artworks</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(120).duration(200)} style={[styles.statCard, styles.statCardHighlight]}>
          <Text style={[styles.statValue, styles.statValueHighlight]} numberOfLines={1} adjustsFontSizeToFit>{formatValue(totalValue)}</Text>
          <Text style={[styles.statLabel, styles.statLabelHighlight]}>Total Value</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(160).duration(200)} style={styles.statCard}>
          <Text style={styles.statValue}>{Object.keys(styleBreakdown).length}</Text>
          <Text style={styles.statLabel}>Styles</Text>
        </Animated.View>
      </Animated.View>

      {topStyles.length > 0 && (
        <Animated.View entering={FadeIn.delay(200).duration(250)} style={styles.stylesSection}>
          <Text style={styles.sectionTitle}>Your Favorite Styles</Text>
          <View style={styles.styleTags}>
            {topStyles.map(([style, count], index) => (
              <Animated.View
                key={style}
                entering={FadeIn.delay(250 + index * 50).duration(200)}
                style={styles.styleTag}
              >
                <Text style={styles.styleTagText}>{style} ({count})</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeIn.delay(300).duration(250)} style={styles.artworksSection}>
        <Text style={styles.sectionTitle}>Liked Artworks</Text>
        <FlatList
          data={likedArtworks}
          renderItem={renderArtworkItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.artworksList}
          columnWrapperStyle={styles.artworksRow}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  statCardFirst: {
    backgroundColor: COLORS.successLight
  },
  statCardHighlight: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.colored(COLORS.primary)
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs
  },
  statValueHighlight: {
    color: COLORS.background
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary
  },
  statLabelHighlight: {
    color: COLORS.background,
    opacity: 0.9
  },
  stylesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  styleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  styleTag: {
    backgroundColor: COLORS.primaryGhost,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  styleTagText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  artworksSection: {
    flex: 1,
    paddingHorizontal: SPACING.lg
  },
  artworksList: {
    paddingBottom: SPACING.xl
  },
  artworksRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  artworkCardWrapper: {
    flex: 1
  },
  artworkCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md
  },
  artworkImage: {
    width: '100%',
    aspectRatio: 3 / 4
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
  artworkArtist: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  artworkPrice: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700'
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
    textAlign: 'center',
    paddingHorizontal: SPACING.xl
  }
})
