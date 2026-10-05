import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
} from "react-native-svg";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
// =========================
// TYPY
// =========================
export type RegularityChartPoint = {
  label: string;
  value: number | null;
};
type Props = {
  data: RegularityChartPoint[];
  averageValue: number | null;
  title?: string;
  periodLabel?: string;
};
// =========================
// STAŁE
// =========================
const CHART_HEIGHT = 158;
const CHART_TOP_PADDING = 12;
const CHART_BOTTOM_PADDING = 10;
const Y_AXIS_WIDTH = 34;
const GRID_VALUES = [100, 75, 50, 25, 0];
// =========================
// HELPERY
// =========================
function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}
function getY(value: number) {
  const normalized = clampPercentage(value);
  const usableHeight =
    CHART_HEIGHT -
    CHART_TOP_PADDING -
    CHART_BOTTOM_PADDING;
  return (
    CHART_TOP_PADDING +
    usableHeight * (1 - normalized / 100)
  );
}
function createLinePath(
  points: {
    x: number;
    y: number;
  }[]
) {
  if (points.length === 0) {
    return "";
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  let path =
    `M ${points[0].x} ${points[0].y}`;
  for (
    let index = 1;
    index < points.length;
    index++
  ) {
    const current = points[index];
    path += ` L ${current.x} ${current.y}`;
  }
  return path;
}
function createAreaPath(
  points: {
    x: number;
    y: number;
  }[],
  bottomY: number
) {
  if (points.length < 2) {
    return "";
  }

  const first = points[0];
  const last = points[points.length - 1];
  return (
    `${createLinePath(points)} ` +
    `L ${last.x} ${bottomY} ` +
    `L ${first.x} ${bottomY} Z`
  );
}
// =========================
// COMPONENT
// =========================
export default function ProgressRegularityChart({
  data,
  averageValue,
  title = "REGULARNOŚĆ",
  periodLabel = "7 DNI",
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    width: screenWidth,
  } = useWindowDimensions();
  // =========================
  // SZEROKOŚĆ
  // =========================
  const availableWidth =
    Math.max(
      220,
      screenWidth - 36 - 32
    );
  const chartWidth =
    Math.max(
      180,
      availableWidth - Y_AXIS_WIDTH
    );
  // PUNKTY
  // =========================
  const horizontalPadding =
    data.length > 1
      ? 10
      : chartWidth / 2;
  const usableWidth =
    Math.max(
      0,
      chartWidth -
        horizontalPadding * 2
    );
  const points =
    data.map(
      (point, index) => {
        let x =
          chartWidth / 2;
        if (data.length > 1) {
          x =
            horizontalPadding +
            (usableWidth * index) /
              (data.length - 1);
        }
        return {
          x,
          y:
            point.value === null
              ? null
              : getY(point.value),
          value:
            point.value === null
              ? null
              : clampPercentage(point.value),
          label:
            point.label,
        };
      }
    );
  type PlottedPoint = {
    x: number;
    y: number;
    value: number;
    label: string;
  };
  const plottedSegments: PlottedPoint[][] = [];
  let currentSegment: PlottedPoint[] = [];
  for (const point of points) {
    if (point.y === null || point.value === null) {
      if (currentSegment.length > 0) {
        plottedSegments.push(currentSegment);
        currentSegment = [];
      }
      continue;
    }
    currentSegment.push({
      x: point.x,
      y: point.y,
      value: point.value,
      label: point.label,
    });
  }
  if (currentSegment.length > 0) {
    plottedSegments.push(currentSegment);
  }
  return (
    <View style={styles.card}>
      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            Wykonanie planu
          </Text>
        </View>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>
            {periodLabel}
          </Text>
        </View>
      </View>
      {/* ===================== */}
      {/* WYKRES */}
      {/* ===================== */}
      <View style={styles.chartRow}>
        {/* OŚ Y */}
        <View style={styles.yAxis}>
          {GRID_VALUES.map(
            (value) => (
              <Text
                key={value}
                style={styles.yAxisText}
              >
                {value}%
              </Text>
            )
          )}
        </View>
        {/* SVG */}
        <View
          style={[
            styles.chartContainer,
            {
              width: chartWidth,
            },
          ]}
        >
          <Svg
            width={chartWidth}
            height={CHART_HEIGHT}
          >
            <Defs>
              <LinearGradient
                id="regularityGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop
                  offset="0"
                  stopColor={colors.accent}
                  stopOpacity="0.14"
                />
                <Stop
                  offset="1"
                  stopColor={colors.accent}
                  stopOpacity="0"
                />
              </LinearGradient>
            </Defs>
            {/* GRID */}
            {GRID_VALUES.map(
              (value) => {
                const y =
                  getY(value);
                return (
                  <Line
                    key={value}
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                );
              }
            )}
            {/* DELIKATNE WYPEŁNIENIE POD LINIĄ */}
            {plottedSegments.map((segment, index) =>
              segment.length > 1 ? (
                <Path
                  key={`area-${index}`}
                  d={createAreaPath(
                    segment,
                    CHART_HEIGHT - CHART_BOTTOM_PADDING
                  )}
                  fill="url(#regularityGradient)"
                />
              ) : null
            )}
            {/* LINIA */}
            {plottedSegments.map((segment, index) =>
              segment.length > 1 ? (
                <Path
                  key={`line-${index}`}
                  d={createLinePath(segment)}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                />
              ) : null
            )}
          </Svg>
          {/* ETYKIETY X */}
          <View
            pointerEvents="none"
            style={styles.xLabels}
          >
            {points.map(
              (point, index) => {
                const labelWidth =
                  Math.max(
                    28,
                    chartWidth /
                      Math.max(
                        1,
                        points.length
                      )
                  );
                return (
                  <Text
                    key={`label-${index}`}
                    numberOfLines={1}
                    style={[
                      styles.xAxisText,
                      {
                        width:
                          labelWidth,
                        left:
                          point.x -
                          labelWidth /
                            2,
                      },
                    ]}
                  >
                    {point.label}
                  </Text>
                );
              }
            )}
          </View>
        </View>
      </View>
      {/* ===================== */}
      {/* PODSUMOWANIE */}
      {/* ===================== */}
      <View style={styles.summary}>
        <View>
          <Text
            style={styles.summaryLabel}
          >
            ŚREDNIA
          </Text>
          <View
            style={
              styles.summaryValueRow
            }
          >
            <Text
              style={styles.summaryValue}
            >
              {averageValue === null
                ? "—"
                : `${clampPercentage(averageValue)}%`}
            </Text>
            <View
              style={
                styles.averageIndicator
              }
            >
              <View
                style={
                  styles.averageDot
                }
              />
              <Text
                style={
                  styles.averageIndicatorText
                }
              >
                regularności
              </Text>
            </View>
          </View>
        </View>
        <View
          style={styles.summaryRight}
        >
          <Text
            style={styles.summaryInfo}
          >
            wykonania
          </Text>
          <Text
            style={
              styles.summaryInfoStrong
            }
          >
            planu
          </Text>
        </View>
      </View>
    </View>
  );
}
// =========================
// STYLE
// =========================
function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 17,
      paddingBottom: 15,
    },
    // =====================
    // HEADER
    // =====================
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },
    title: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.9,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
      marginTop: 4,
    },
    periodBadge: {
      minHeight: 28,
      paddingHorizontal: 11,
      borderRadius: 10,
      backgroundColor:
        colors.accentSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      justifyContent:
        "center",
    },
    periodText: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    // =====================
    // CHART
    // =====================
    chartRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
    },
    yAxis: {
      width:
        Y_AXIS_WIDTH,
      height:
        CHART_HEIGHT,
      paddingTop:
        CHART_TOP_PADDING -
        5,
      paddingBottom:
        CHART_BOTTOM_PADDING -
        5,
      justifyContent:
        "space-between",
      paddingRight: 6,
    },
    yAxisText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "600",
      textAlign: "right",
    },
    chartContainer: {
      height:
        CHART_HEIGHT + 29,
      position: "relative",
    },
    // =====================
    // X LABELS
    // =====================
    xLabels: {
      position: "absolute",
      top:
        CHART_HEIGHT + 8,
      left: 0,
      right: 0,
      height: 20,
    },
    xAxisText: {
      position: "absolute",
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "700",
      textAlign: "center",
    },
    // =====================
    // SUMMARY
    // =====================
    summary: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      flexDirection: "row",
      alignItems:
        "flex-end",
      justifyContent:
        "space-between",
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    summaryValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 3,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 25,
      fontWeight: "800",
      letterSpacing: -0.7,
    },
    averageIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingTop: 5,
    },
    averageDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        colors.accent,
    },
    averageIndicatorText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
    },
    summaryRight: {
      alignItems: "flex-end",
      paddingBottom: 3,
    },
    summaryInfo: {
      color: colors.textMuted,
      fontSize: 9,
    },
    summaryInfoStrong: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "700",
      marginTop: 2,
    },
    });
}
