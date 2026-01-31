import React, { useEffect } from 'react'
import { StyleSheet, ViewStyle, Pressable, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideInUp,
  ZoomIn,
  BounceIn,
  runOnJS,
} from 'react-native-reanimated'

// ============ Animation Config Constants ============

// Smooth, subtle spring - minimal bounce
export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
}

export const TIMING_FAST = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

export const TIMING_SMOOTH = {
  duration: 250,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
}

// ============ Pre-built Entering Animations (smooth, no bounce) ============

export const enteringAnimations = {
  fadeIn: FadeIn.duration(300),
  fadeInDown: FadeInDown.duration(300),
  fadeInUp: FadeInUp.duration(300),
  fadeInLeft: FadeInLeft.duration(250),
  fadeInRight: FadeInRight.duration(250),
  slideInDown: SlideInDown.duration(300),
  slideInUp: SlideInUp.duration(300),
  zoomIn: ZoomIn.duration(250),
  bounceIn: FadeIn.duration(300), // replaced bounce with fade
}

// ============ Animated Button Component ============

interface AnimatedButtonProps {
  onPress: () => void
  children: React.ReactNode
  style?: ViewStyle
  disabled?: boolean
  hapticFeedback?: boolean
}

export function AnimatedButton({ onPress, children, style, disabled }: AnimatedButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

// ============ Scale on Press Component ============

interface ScaleOnPressProps {
  onPress?: () => void
  children: React.ReactNode
  style?: ViewStyle
  scaleValue?: number
}

export function ScaleOnPress({ onPress, children, style, scaleValue = 0.98 }: ScaleOnPressProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(scaleValue, { duration: 100 }) }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }) }}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

// ============ Fade In View Component ============

interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  style?: ViewStyle
}

export function FadeInView({ children, delay = 0, duration = 400, style }: FadeInViewProps) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// ============ Staggered List Item ============

interface StaggeredItemProps {
  children: React.ReactNode
  index: number
  style?: ViewStyle
}

export function StaggeredItem({ children, index, style }: StaggeredItemProps) {
  const delay = index * 50 // 50ms between each item

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(200)}
      style={style}
    >
      {children}
    </Animated.View>
  )
}

// ============ Pulse Animation Component ============

interface PulseProps {
  children: React.ReactNode
  style?: ViewStyle
  active?: boolean
}

export function Pulse({ children, style, active = true }: PulseProps) {
  const scale = useSharedValue(1)

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      )
    } else {
      scale.value = withTiming(1, { duration: 200 })
    }
  }, [active])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// ============ Shimmer Loading Component ============

interface ShimmerProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export function Shimmer({ width, height, borderRadius = 8, style }: ShimmerProps) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
        },
        style,
        animatedStyle,
      ]}
    />
  )
}

// ============ Floating Action Component ============

interface FloatingProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function Floating({ children, style }: FloatingProps) {
  const translateY = useSharedValue(0)

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// ============ Typing Indicator Component ============

export function TypingIndicator() {
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    )

    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    )

    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    )
  }, [])

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }))

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }))

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }))

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, dot1Style]} />
      <Animated.View style={[styles.typingDot, dot2Style]} />
      <Animated.View style={[styles.typingDot, dot3Style]} />
    </View>
  )
}

// ============ Heart Pop Animation ============

interface HeartPopProps {
  visible: boolean
  onComplete?: () => void
}

export function HeartPop({ visible, onComplete }: HeartPopProps) {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 100 })
      )
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 200 }))
      )
    } else {
      scale.value = 0
      opacity.value = 0
    }
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.heartPopContainer, animatedStyle]}>
      <Animated.Text style={styles.heartPopText}>❤️</Animated.Text>
    </Animated.View>
  )
}

// ============ Progress Bar Animation ============

interface AnimatedProgressBarProps {
  progress: number // 0-1
  height?: number
  backgroundColor?: string
  fillColor?: string
  style?: ViewStyle
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  backgroundColor = '#E5E7EB',
  fillColor = '#6366f1',
  style,
}: AnimatedProgressBarProps) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(progress * 100, { duration: 400, easing: Easing.out(Easing.ease) })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View style={[styles.progressBarContainer, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          { backgroundColor: fillColor, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  )
}

// ============ Counter Animation ============

interface AnimatedCounterProps {
  value: number
  style?: any
}

export function AnimatedCounter({ value, style }: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0)
  const displayValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 1000 })
  }, [value])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            animatedValue.value % 1,
            [0, 0.5, 1],
            [1, 1.1, 1]
          ),
        },
      ],
    }
  })

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {value}
    </Animated.Text>
  )
}

// ============ Styles ============

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  heartPopContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  heartPopText: {
    fontSize: 60,
  },
  progressBarContainer: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
})
