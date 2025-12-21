import React, { memo, useEffect } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type PerCharStyleFn = (char: string, index: number) => StyleProp<TextStyle>;

type Props = {
  text: string;

  containerStyle?: StyleProp<ViewStyle>;

  letterStyle?: StyleProp<TextStyle>;

  perCharStyle?: PerCharStyleFn;

  delayPerChar?: number;
  duration?: number;
  fromY?: number;

  replayKey?: string | number;
};

function AnimatedChar({
  char,
  index,
  letterStyle,
  perCharStyle,
  delayPerChar,
  duration,
  fromY,
  replayKey,
}: {
  char: string;
  index: number;
  letterStyle?: StyleProp<TextStyle>;
  perCharStyle?: PerCharStyleFn;
  delayPerChar: number;
  duration: number;
  fromY: number;
  replayKey?: string | number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = fromY;

    const d = index * delayPerChar;

    opacity.value = withDelay(
      d,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      d,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [replayKey]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[letterStyle, perCharStyle?.(char, index), aStyle]}>
      {char === " " ? "\u00A0" : char}
    </Animated.Text>
  );
}

function AnimatedText({
  text,
  containerStyle,
  letterStyle,
  perCharStyle,
  delayPerChar = 45,
  duration = 220,
  fromY = 8,
  replayKey,
}: Props) {
  return (
    <Animated.View style={[{ flexDirection: "row" }, containerStyle]}>
      {text.split("").map((char, index) => (
        <AnimatedChar
          key={`${char}-${index}-${replayKey ?? ""}`}
          char={char}
          index={index}
          letterStyle={letterStyle}
          perCharStyle={perCharStyle}
          delayPerChar={delayPerChar}
          duration={duration}
          fromY={fromY}
          replayKey={replayKey}
        />
      ))}
    </Animated.View>
  );
}

export default memo(AnimatedText);
