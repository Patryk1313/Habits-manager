import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { HabitColor } from "../constants/habit-colors";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
import ColorHuePicker from "./ColorHuePicker";
import {
  createHabitColorFromHue,
  getHueFromHex,
} from "../utils/hue-color";

type Props = {
  visible: boolean;
  selectedColor: HabitColor;
  onSelect: (color: HabitColor) => void;
  onClose: () => void;
};

export default function ColorPicker({
  visible,
  selectedColor,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Wybierz kolor
              </Text>

              <Text style={styles.subtitle}>
                Nadaj nawykowi własny charakter
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.sectionLabel}>
              KOLOR NAWYKU
            </Text>

            <ColorHuePicker
              hue={getHueFromHex(selectedColor.primary)}
              onChange={(hue) =>
                onSelect(createHabitColorFromHue(hue))
              }
            />

            <Text style={styles.sectionLabel}>
              PODGLĄD
            </Text>

            <View style={styles.previewCard}>
              <View
                style={[
                  styles.previewIcon,
                  {
                    backgroundColor:
                      selectedColor.light,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewIconText,
                    {
                      color:
                        selectedColor.primary,
                    },
                  ]}
                >
                  ✓
                </Text>
              </View>

              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>
                  Twój nawyk
                </Text>

                <Text style={styles.previewSubtitle}>
                  Codziennie
                </Text>
              </View>

              <View
                style={[
                  styles.previewCircle,
                  {
                    borderColor:
                      selectedColor.primary,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.accentPreview,
                {
                  backgroundColor:
                    selectedColor.light,
                },
              ]}
            >
              <View
                style={[
                  styles.accentDot,
                  {
                    backgroundColor:
                      selectedColor.primary,
                  },
                ]}
              />

              <View style={styles.accentContent}>
                <Text
                  style={[
                    styles.accentTitle,
                    {
                      color:
                        selectedColor.dark,
                    },
                  ]}
                >
                  {selectedColor.name}
                </Text>

                <Text style={styles.accentSubtitle}>
                  Ten kolor będzie używany w
                  aplikacji do oznaczania nawyku.
                </Text>
              </View>
            </View>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      "rgba(15, 15, 20, 0.42)",
  },

  sheet: {
    height: "76%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: "hidden",
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: colors.textSecondary,
    fontSize: 25,
  },

  content: {
    paddingHorizontal: 18,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 28,
  },

  colorCard: {
    width: "31%",
    minHeight: 94,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  colorCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  colorName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 7,
  },

  previewCard: {
    minHeight: 80,
    backgroundColor: colors.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  previewIconText: {
    fontSize: 20,
    fontWeight: "800",
  },

  previewContent: {
    flex: 1,
  },

  previewTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  previewSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },

  previewCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 2,
  },

  accentPreview: {
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 20,
  },

  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 11,
  },

  accentContent: {
    flex: 1,
  },

  accentTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  accentSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  bottomSpace: {
    height: 30,
  },
  });
}