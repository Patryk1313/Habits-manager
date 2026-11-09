import { Pressable, StyleSheet, Text } from "react-native";
import { useRoutineEntries } from "../context/RoutineEntriesContext";
import { useTheme } from "../context/ThemeContext";

type Props = {
  routineId: string;
  date: string;
  stepId?: string;
  label: string;
  disabled?: boolean;
};

export default function RoutineSkipButton({ routineId, date, stepId, label, disabled }: Props) {
  const { colors } = useTheme();
  const { isRoutineSkipped, isStepSkipped, isStepCompleted, setRoutineSkipped, setStepSkipped } = useRoutineEntries();
  const routineSkipped = isRoutineSkipped(routineId, date);
  const skipped = stepId === undefined ? routineSkipped : isStepSkipped(routineId, stepId, date);
  const blocked = disabled || (stepId !== undefined &&
    (routineSkipped || isStepCompleted(routineId, stepId, date)));
  if (blocked && !skipped) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${skipped ? "Cofnij pominięcie" : "Pomiń"}: ${label}`}
      disabled={blocked}
      onPress={(event) => {
        event.stopPropagation();
        if (stepId === undefined) setRoutineSkipped(routineId, date, !skipped);
        else setStepSkipped(routineId, stepId, date, !skipped);
      }}
      style={[styles.button, blocked && styles.disabled]}
    >
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {skipped ? "Cofnij pominięcie" : "Pomiń"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 12, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
