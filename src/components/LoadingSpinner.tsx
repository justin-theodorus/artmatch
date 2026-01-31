import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/styles'

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export default function LoadingSpinner({
  message,
  size = 'medium',
  color = COLORS.primary
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0)
  const scale = useSharedValue(1)

  const sizes = {
    small: 24,
    medium: 40,
    large: 56,
  }

  const spinnerSize = sizes[size]

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    )

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    )
  }, [])

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }))

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderColor: color,
          },
          spinnerStyle,
        ]}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

// Dot loading animation
export function LoadingDots({ color = COLORS.primary }: { color?: string }) {
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  useEffect(() => {
    const animate = (value: Animated.SharedValue<number>, delay: number) => {
      value.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(-8, { duration: 200 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      )
    }

    animate(dot1, 0)
    animate(dot2, 150)
    animate(dot3, 300)
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
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot3Style]} />
    </View>
  )
}

// Pulsing circle animation
export function PulsingLoader({ color = COLORS.primary }: { color?: string }) {
  const scale1 = useSharedValue(0)
  const scale2 = useSharedValue(0)
  const opacity1 = useSharedValue(1)
  const opacity2 = useSharedValue(1)

  useEffect(() => {
    const duration = 1500

    scale1.value = withRepeat(
      withTiming(2, { duration, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )
    opacity1.value = withRepeat(
      withTiming(0, { duration, easing: Easing.out(Easing.ease) }),
      -1,
      false
    )

    setTimeout(() => {
      scale2.value = withRepeat(
        withTiming(2, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
      opacity2.value = withRepeat(
        withTiming(0, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    }, duration / 2)
  }, [])

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }))

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }))

  return (
    <View style={styles.pulsingContainer}>
      <Animated.View style={[styles.pulsingCircle, { borderColor: color }, circle1Style]} />
      <Animated.View style={[styles.pulsingCircle, { borderColor: color }, circle2Style]} />
      <View style={[styles.pulsingCenter, { backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pulsingContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingCircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  pulsingCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
})
