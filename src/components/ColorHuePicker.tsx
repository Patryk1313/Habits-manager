import { useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
import { hueToHex } from "../utils/hue-color";

type Props = {
  hue: number;
  onChange: (hue: number) => void;
};

export default function ColorHuePicker({
  hue,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [width, setWidth] = useState(0);

  const setHueFromX = (position: number) => {
    if (width <= 0) return;
    const clampedPosition = Math.max(0, Math.min(width, position));
    onChange(Math.round((clampedPosition / width) * 359));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderGrant: (event) =>
      setHueFromX(event.nativeEvent.locationX),
    onPanResponderMove: (event) =>
      setHueFromX(event.nativeEvent.locationX),
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const normalizedHue = ((hue % 360) + 360) % 360;
  const thumbLeft =
    width > 18
      ? 9 + (normalizedHue / 359) * (width - 18)
      : 9;
  const currentColor = hueToHex(normalizedHue);

  return (
    <View style={styles.container}>
      <View
        style={styles.trackArea}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Odcień koloru"
        accessibilityValue={{ min: 0, max: 359, now: normalizedHue }}
        accessibilityActions={[
          { name: "increment", label: "Zwiększ odcień" },
          { name: "decrement", label: "Zmniejsz odcień" },
        ]}
        onAccessibilityAction={(event) => {
          const delta = event.nativeEvent.actionName === "increment" ? 8 : -8;
          onChange((normalizedHue + delta + 360) % 360);
        }}
      >
        {width > 0 && (
          <Svg
            pointerEvents="none"
            width={width}
            height={16}
            style={styles.svgTrack}
          >
            <Defs>
              <LinearGradient
                id="habitHueSpectrum"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <Stop offset="0%" stopColor="#F5222D" />
                <Stop offset="16.6%" stopColor="#FADB14" />
                <Stop offset="33.3%" stopColor="#52C41A" />
                <Stop offset="50%" stopColor="#13C2C2" />
                <Stop offset="66.6%" stopColor="#1677FF" />
                <Stop offset="83.3%" stopColor="#722ED1" />
                <Stop offset="100%" stopColor="#F5222D" />
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={width}
              height={16}
              rx={8}
              fill="url(#habitHueSpectrum)"
            />
          </Svg>
        )}
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: thumbLeft - 9,
              backgroundColor: currentColor,
              borderColor: colors.surface,
            },
          ]}
        />
      </View>
      <View style={styles.selectedColorRow}>
        <View
          style={[
            styles.selectedColorSwatch,
            { backgroundColor: currentColor },
          ]}
        />
        <View style={styles.selectedColorTextGroup}>
          <Text style={styles.selectedColorLabel}>Wybrany kolor</Text>
          <Text style={styles.selectedColorValue}>{currentColor}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: {
      width: "100%",
      marginBottom: 18,
    },
    trackArea: {
      height: 46,
      justifyContent: "center",
      overflow: "visible",
    },
    svgTrack: {
      position: "absolute",
      left: 0,
      top: 15,
    },
    thumb: {
      position: "absolute",
      top: 6,
      width: 18,
      height: 34,
      borderRadius: 9,
      borderWidth: 3,
    },
    selectedColorRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginTop: 7,
    },
    selectedColorSwatch: {
      width: 23,
      height: 23,
      borderRadius: 8,
      marginRight: 10,
    },
    selectedColorTextGroup: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectedColorLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    selectedColorValue: {
      color: colors.textMuted,
      fontSize: 11,
      fontVariant: ["tabular-nums"],
    },
  });
}