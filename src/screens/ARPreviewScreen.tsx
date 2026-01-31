import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Artwork } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/styles'
import { artworkAPI } from '../services/api'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Pixels per inch at different simulated viewing distances
// These values simulate how large artwork appears at different distances
const DISTANCE_PRESETS = [
  { label: 'Close', distance: '3 ft', pixelsPerInch: 12 },
  { label: 'Medium', distance: '6 ft', pixelsPerInch: 8 },
  { label: 'Far', distance: '10 ft', pixelsPerInch: 5 }
]

export default function ARPreviewScreen ({ route, navigation }: any) {
  const { artworkId } = route.params
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraType, setCameraType] = useState<CameraType>('back')
  const [distanceIndex, setDistanceIndex] = useState(1) // Default to "Medium"
  
  // Artwork overlay position only (no scale - it's calculated from physical dimensions)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(-50)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(-50)
  
  useEffect(() => {
    loadArtwork()
  }, [artworkId])
  
  const loadArtwork = async () => {
    try {
      setLoading(true)
      const artworkData = await artworkAPI.getArtwork(artworkId)
      setArtwork(artworkData)
    } catch (error) {
      console.error('Error loading artwork:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate artwork size based on physical dimensions and selected distance
  const artworkSize = useMemo(() => {
    if (!artwork) return { width: 200, height: 200 }
    
    const { width: inchesW, height: inchesH } = artwork.dimensions
    const ppi = DISTANCE_PRESETS[distanceIndex].pixelsPerInch
    
    let calcWidth = inchesW * ppi
    let calcHeight = inchesH * ppi
    
    // Ensure artwork fits on screen with some padding
    const maxWidth = SCREEN_WIDTH * 0.85
    const maxHeight = SCREEN_HEIGHT * 0.5
    
    if (calcWidth > maxWidth) {
      const ratio = maxWidth / calcWidth
      calcWidth = maxWidth
      calcHeight = calcHeight * ratio
    }
    
    if (calcHeight > maxHeight) {
      const ratio = maxHeight / calcHeight
      calcHeight = maxHeight
      calcWidth = calcWidth * ratio
    }
    
    return { width: calcWidth, height: calcHeight }
  }, [artwork, distanceIndex])
  
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX
      translateY.value = savedTranslateY.value + event.translationY
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value)
      translateY.value = withSpring(translateY.value)
    })
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }))
  
  const resetPosition = () => {
    translateX.value = withSpring(0)
    translateY.value = withSpring(-50)
    savedTranslateX.value = 0
    savedTranslateY.value = -50
  }
  
  if (loading || !artwork) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }
  
  if (!permission) {
    return <View style={styles.centerContainer} />
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  const dimensions = artwork.dimensions
  const dimensionText = `${dimensions.width}" × ${dimensions.height}"`
  
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={cameraType}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <View style={styles.infoCard}>
              <Text style={styles.artworkTitle}>{artwork.title}</Text>
              <Text style={styles.dimensionText}>{dimensionText}</Text>
            </View>
          </View>
          
          <View style={styles.artworkContainer}>
            <GestureDetector gesture={panGesture}>
              <Animated.Image
                source={{ uri: artwork.image_url }}
                style={[
                  styles.artworkPreview,
                  { width: artworkSize.width, height: artworkSize.height },
                  animatedStyle
                ]}
                resizeMode="contain"
              />
            </GestureDetector>
          </View>
          
          <View style={styles.bottomBar}>
            <View style={styles.distanceSection}>
              <Text style={styles.distanceLabel}>Viewing Distance</Text>
              <View style={styles.distanceButtons}>
                {DISTANCE_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.distanceButton,
                      index === distanceIndex && styles.distanceButtonActive
                    ]}
                    onPress={() => setDistanceIndex(index)}
                  >
                    <Text style={[
                      styles.distanceButtonLabel,
                      index === distanceIndex && styles.distanceButtonLabelActive
                    ]}>
                      {preset.label}
                    </Text>
                    <Text style={[
                      styles.distanceButtonValue,
                      index === distanceIndex && styles.distanceButtonValueActive
                    ]}>
                      {preset.distance}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={resetPosition}>
              <Text style={styles.controlButtonText}>Reset Position</Text>
            </TouchableOpacity>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                Drag to reposition • Size shows actual dimensions
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.text
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  camera: {
    flex: 1
  },
  overlay: {
    flex: 1
  },
  topBar: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md
  },
  artworkTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  dimensionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary
  },
  artworkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  artworkPreview: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  bottomBar: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md
  },
  distanceSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  distanceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  distanceButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs
  },
  distanceButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    minWidth: 70
  },
  distanceButtonActive: {
    backgroundColor: COLORS.background
  },
  distanceButtonLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600'
  },
  distanceButtonLabelActive: {
    color: COLORS.text
  },
  distanceButtonValue: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2
  },
  distanceButtonValueActive: {
    color: COLORS.textSecondary
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full
  },
  controlButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600'
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full
  },
  instructionsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background
  },
  permissionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center'
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md
  },
  permissionButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600'
  }
})
