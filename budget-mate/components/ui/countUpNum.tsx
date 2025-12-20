import { useEffect } from "react";
import { StyleProp, TextInput, TextStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  value: number;
  duration?: number; 
  prefix?: string;   
  decimals?: number; 
  style?: StyleProp<TextStyle>;
};

export default function CountUpNumber({
  value,
  duration = 650,
  prefix = "",
  decimals = 2,
  style,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => {
    const current = value * progress.value;

    const formatted =
      prefix + current.toFixed(decimals);

    return { text: formatted } as any;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      value="" 
      animatedProps={animatedProps}
      style={style}
    />
  );
}
