import { useRef, useCallback } from "react";
import { Animated } from "react-native";
import { useFocusEffect } from "expo-router";

export default function useTabAnimation() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(.6);
      scale.setValue(0.97);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }, [opacity, scale])
  );

  return { opacity, scale };
}
