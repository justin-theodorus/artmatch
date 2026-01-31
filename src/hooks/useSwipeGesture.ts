import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated'
import { Gesture } from 'react-native-gesture-handler'

interface UseSwipeGestureProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  screenWidth: number
}

export function useSwipeGesture ({ onSwipeLeft, onSwipeRight, screenWidth }: UseSwipeGestureProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const rotate = useSharedValue(0)
  
  const SWIPE_THRESHOLD = screenWidth * 0.3
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
      translateY.value = event.translationY
      rotate.value = event.translationX / 20
    })
    .onEnd((event) => {
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD
      
      if (shouldSwipeRight) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeRight)()
        })
      } else if (shouldSwipeLeft) {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeLeft)()
        })
      } else {
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
        rotate.value = withSpring(0)
      }
    })
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ]
  }))
  
  const reset = () => {
    translateX.value = 0
    translateY.value = 0
    rotate.value = 0
  }
  
  return {
    panGesture,
    animatedStyle,
    translateX,
    reset
  }
}
