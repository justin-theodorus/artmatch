import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Layout,
} from 'react-native-reanimated'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/styles'
import { ART_STYLES, STYLE_DESCRIPTIONS } from '../constants/artStyles'
import { userAPI } from '../services/api'
import { useUserStore } from '../store/userStore'
import { AnimatedProgressBar, ScaleOnPress } from '../components/animations'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SAMPLE_ARTWORKS = [
  { id: '1', style: 'abstract', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80' },
  { id: '2', style: 'contemporary', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80' },
  { id: '3', style: 'minimalist', image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80' },
  { id: '4', style: 'landscape', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
  { id: '5', style: 'portrait', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80' },
  { id: '6', style: 'impressionist', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80' }
]

export default function OnboardingScreen ({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState(0)
  const [stylePreferences, setStylePreferences] = useState<Record<string, number>>({})
  const [budgetMin, setBudgetMin] = useState(500)
  const [budgetMax, setBudgetMax] = useState(5000)
  const setUser = useUserStore((state) => state.setUser)
  
  const currentArtworks = SAMPLE_ARTWORKS.slice(step * 2, step * 2 + 2)
  
  const handleStyleChoice = (style: string) => {
    // Increment preference score for chosen style
    setStylePreferences(prev => ({
      ...prev,
      [style]: (prev[style] || 0) + 0.3
    }))
    
    if (step < 2) {
      setStep(step + 1)
    } else {
      // Move to budget selection
      setStep(3)
    }
  }
  
  const handleBudgetSelect = async (min: number, max: number) => {
    setBudgetMin(min)
    setBudgetMax(max)
    
    // Create user and save preferences
    try {
      const newUser = await userAPI.createUser(
        `user_${Date.now()}`,
        min,
        max
      )
      
      await userAPI.updatePreferences(
        newUser.id,
        {
          styles: stylePreferences,
          budget_range: [min, max]
        },
        min,
        max
      )
      
      // Update local user state
      setUser({
        ...newUser,
        budget_min: min,
        budget_max: max,
        preferences: {
          styles: stylePreferences,
          budget_range: [min, max]
        },
        onboarding_completed: true
      })
      
      // Navigate to main app
      navigation.replace('Main')
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }
  
  if (step < 3) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
        <Animated.View entering={FadeIn.duration(250)} style={styles.header}>
          <Text style={styles.title}>Discover Your Style</Text>
          <Text style={styles.subtitle}>Which artwork speaks to you?</Text>
          <View style={styles.progressContainer}>
            <AnimatedProgressBar
              progress={(step + 1) / 4}
              height={6}
              backgroundColor={COLORS.border}
              fillColor={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>Step {step + 1} of 4</Text>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.choiceContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentArtworks.map((artwork, index) => (
            <Animated.View
              key={`${step}-${artwork.id}`}
              entering={FadeIn.delay(index * 100).duration(250)}
              exiting={FadeOut.duration(150)}
            >
              <ScaleOnPress
                onPress={() => handleStyleChoice(artwork.style)}
                style={styles.artworkChoice}
                scaleValue={0.99}
              >
                <Image
                  source={{ uri: artwork.image }}
                  style={styles.artworkImage}
                  resizeMode="cover"
                />
                <View style={styles.artworkOverlay}>
                  <View style={styles.styleNameContainer}>
                    <Text style={styles.styleName}>{artwork.style}</Text>
                  </View>
                </View>
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>Tap to select</Text>
                </View>
              </ScaleOnPress>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    )
  }

  // Budget selection step
  const BUDGET_OPTIONS = [
    { label: 'Under $1,000', min: 0, max: 1000 },
    { label: '$1,000 - $3,000', min: 1000, max: 3000 },
    { label: '$3,000 - $5,000', min: 3000, max: 5000 },
    { label: '$5,000 - $10,000', min: 5000, max: 10000 },
    { label: 'Above $10,000', min: 10000, max: 50000 }
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
      <Animated.View entering={FadeIn.duration(250)} style={styles.header}>
        <Text style={styles.title}>Set Your Budget</Text>
        <Text style={styles.subtitle}>What's your comfortable price range?</Text>
        <View style={styles.progressContainer}>
          <AnimatedProgressBar
            progress={1}
            height={6}
            backgroundColor={COLORS.border}
            fillColor={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>Final step</Text>
        </View>
      </Animated.View>

      <View style={styles.budgetContainer}>
        {BUDGET_OPTIONS.map((option, index) => (
          <AnimatedPressable
            key={option.label}
            entering={FadeIn.delay(index * 60).duration(200)}
            style={styles.budgetOption}
            onPress={() => handleBudgetSelect(option.min, option.max)}
          >
            {/* <Text style={styles.budgetIcon}>{option.icon}</Text> */}
            <Text style={styles.budgetLabel}>{option.label}</Text>
            <Text style={styles.budgetArrow}>→</Text>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  )
}

const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2
const CARD_HEIGHT = CARD_WIDTH * 0.65

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center'
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center'
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center'
  },
  progressBar: {
    width: '60%',
    marginBottom: SPACING.sm
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight
  },
  scrollContainer: {
    flex: 1
  },
  choiceContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.lg
  },
  artworkChoice: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
    ...SHADOWS.lg
  },
  artworkImage: {
    width: '100%',
    height: '100%'
  },
  artworkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'transparent',
    // Gradient effect using multiple layers
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl
  },
  styleNameContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full
  },
  styleName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.background,
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  tapHint: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full
  },
  tapHintText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600'
  },
  budgetContainer: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md
  },
  budgetOption: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm
  },
  budgetIcon: {
    fontSize: 24,
    marginRight: SPACING.md
  },
  budgetLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1
  },
  budgetArrow: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary
  }
})
