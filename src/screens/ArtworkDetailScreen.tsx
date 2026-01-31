import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Pressable } from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated'
import { Artwork, Gallery } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { artworkAPI, galleryAPI } from '../services/api'
import { Shimmer, ScaleOnPress } from '../components/animations'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function ArtworkDetailScreen ({ route, navigation }: any) {
  const { artworkId } = route.params
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadArtworkDetails()
  }, [artworkId])
  
  const loadArtworkDetails = async () => {
    try {
      setLoading(true)
      const artworkData = await artworkAPI.getArtwork(artworkId)
      setArtwork(artworkData)
      
      if (artworkData.gallery_id) {
        const galleryData = await galleryAPI.getGallery(artworkData.gallery_id)
        setGallery(galleryData)
      }
    } catch (error) {
      console.error('Error loading artwork:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading || !artwork) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <Shimmer width={SCREEN_WIDTH} height={SCREEN_WIDTH * 1.2} borderRadius={0} />
        <View style={styles.content}>
          <Shimmer width="70%" height={32} borderRadius={8} />
          <Shimmer width="50%" height={24} borderRadius={8} style={{ marginTop: 8 }} />
          <Shimmer width="30%" height={20} borderRadius={8} style={{ marginTop: 8 }} />
          <Shimmer width="40%" height={28} borderRadius={8} style={{ marginTop: 16 }} />
        </View>
      </Animated.View>
    )
  }

  const dimensions = artwork.dimensions
  const dimensionText = `${dimensions.width}" × ${dimensions.height}"${dimensions.depth ? ` × ${dimensions.depth}"` : ''}`

  return (
    <AnimatedScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <Image
          source={{ uri: artwork.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(100).duration(300)}
        style={styles.content}
      >
        <Animated.Text entering={FadeIn.delay(150).duration(250)} style={styles.title}>
          {artwork.title}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(180).duration(250)} style={styles.artist}>
          {artwork.artist}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(210).duration(250)} style={styles.year}>
          {artwork.year_created}
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(240).duration(250)} style={styles.priceContainer}>
          <Text style={styles.price}>${artwork.price.toLocaleString()}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: artwork.availability_status === 'available' ? COLORS.success : COLORS.textLight }
          ]}>
            <Text style={styles.statusText}>{artwork.availability_status}</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeIn.delay(270).duration(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>🎨</Text>
              <Text style={styles.detailCardLabel}>Medium</Text>
              <Text style={styles.detailCardValue}>{artwork.medium}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>🖼️</Text>
              <Text style={styles.detailCardLabel}>Style</Text>
              <Text style={styles.detailCardValue}>{artwork.style}</Text>
            </View>
            <View style={[styles.detailCard, styles.detailCardFull]}>
              <Text style={styles.detailIcon}>📐</Text>
              <Text style={styles.detailCardLabel}>Dimensions</Text>
              <Text style={styles.detailCardValue}>{dimensionText}</Text>
            </View>
          </View>
        </Animated.View>

        {artwork.description && (
          <Animated.View entering={FadeIn.delay(300).duration(250)}>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Piece</Text>
              <Text style={styles.description}>{artwork.description}</Text>
            </View>
          </Animated.View>
        )}

        {gallery && (
          <Animated.View entering={FadeIn.delay(330).duration(250)}>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <View style={styles.galleryCard}>
                <View style={styles.galleryInfo}>
                  <Text style={styles.galleryName}>{gallery.name}</Text>
                  <Text style={styles.galleryAddress}>{gallery.address}</Text>
                </View>
                {gallery.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(360).duration(250)} style={styles.actions}>
          <ScaleOnPress
            onPress={() => navigation.navigate('ARPreview', { artworkId: artwork.id })}
            style={[styles.actionButton, styles.arButton]}
          >
            <Text style={styles.actionButtonIcon}>📱</Text>
            <Text style={styles.actionButtonText}>View in AR</Text>
          </ScaleOnPress>

          <ScaleOnPress
            onPress={() => {}}
            style={[styles.actionButton, styles.contactButton]}
          >
            <Text style={styles.actionButtonIcon}>💬</Text>
            <Text style={styles.actionButtonText}>Contact Gallery</Text>
          </ScaleOnPress>
        </Animated.View>
      </Animated.View>
    </AnimatedScrollView>
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
    backgroundColor: COLORS.background
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2
  },
  content: {
    padding: SPACING.lg,
    marginTop: -SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  artist: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  year: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginBottom: SPACING.md
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg
  },
  section: {
    marginBottom: SPACING.md
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center'
  },
  detailCardFull: {
    minWidth: '100%'
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs
  },
  detailCardLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  detailCardValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm
  },
  detailLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    width: 100
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    textTransform: 'capitalize'
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 26
  },
  galleryCard: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center'
  },
  galleryInfo: {
    flex: 1
  },
  galleryName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  galleryAddress: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary
  },
  verifiedBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full
  },
  verifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700'
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl
  },
  actionButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm
  },
  arButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.colored(COLORS.primary)
  },
  contactButton: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.colored(COLORS.secondary)
  },
  actionButtonIcon: {
    fontSize: 20
  },
  actionButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600'
  }
})
