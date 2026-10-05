import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import type { LegacyHabitIcon } from "../types/legacy-habit-icon";
import { additionalHabitIconOptions } from "../constants/habit-icon-options";
import type { HabitIconOption } from "../constants/habit-icon-options";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
import HabitIcon, {
  isHabitIconName,
} from "./HabitIcon";
import type { HabitIconName } from "./HabitIcon";

const iconOptions: HabitIconOption[] = [
  { name: "Activity", label: "Aktywność", category: "Zdrowie", keywords: ["ruch", "ćwiczenia"] },
  { name: "Heart", label: "Serce", category: "Zdrowie", keywords: ["zdrowie", "miłość"] },
  { name: "HeartPulse", label: "Tętno", category: "Zdrowie", keywords: ["zdrowie", "puls"] },
  { name: "Stethoscope", label: "Badanie", category: "Zdrowie", keywords: ["lekarz", "zdrowie"] },
  { name: "Pill", label: "Lek", category: "Zdrowie", keywords: ["tabletka", "suplement", "witamina"] },
  { name: "Cross", label: "Pierwsza pomoc", category: "Zdrowie", keywords: ["medycyna", "zdrowie"] },
  { name: "Thermometer", label: "Temperatura", category: "Zdrowie", keywords: ["zdrowie", "pomiar"] },
  { name: "Droplets", label: "Woda", category: "Zdrowie", keywords: ["woda", "picie", "nawodnienie"] },
  { name: "Dumbbell", label: "Siłownia", category: "Sport", keywords: ["siłownia", "trening", "ciężary"] },
  { name: "Bike", label: "Rower", category: "Sport", keywords: ["rower", "jazda", "kolarstwo"] },
  { name: "Footprints", label: "Bieganie", category: "Sport", keywords: ["bieganie", "spacer", "kroki", "chodzenie"] },
  { name: "PersonStanding", label: "Ruch", category: "Sport", keywords: ["ćwiczenia", "aktywność"] },
  { name: "Trophy", label: "Osiągnięcie", category: "Sport", keywords: ["sport", "wygrana", "cel"] },
  { name: "Timer", label: "Trening", category: "Sport", keywords: ["czas", "sport", "interwały"] },
  { name: "Target", label: "Cel", category: "Sport", keywords: ["sport", "postęp", "koncentracja"] },
  { name: "Moon", label: "Sen", category: "Sen", keywords: ["sen", "noc", "odpoczynek"] },
  { name: "Bed", label: "Łóżko", category: "Sen", keywords: ["sen", "spanie", "odpoczynek"] },
  { name: "AlarmClock", label: "Budzik", category: "Sen", keywords: ["sen", "pobudka", "rano"] },
  { name: "Sunrise", label: "Poranek", category: "Sen", keywords: ["rano", "wstawanie", "sen"] },
  { name: "Apple", label: "Zdrowe jedzenie", category: "Jedzenie", keywords: ["jedzenie", "owoc", "jabłko", "dieta"] },
  { name: "Coffee", label: "Kawa", category: "Jedzenie", keywords: ["kawa", "napój", "picie"] },
  { name: "CupSoda", label: "Napój", category: "Jedzenie", keywords: ["picie", "woda", "sok"] },
  { name: "Utensils", label: "Jedzenie", category: "Jedzenie", keywords: ["posiłek", "obiad", "dieta"] },
  { name: "CookingPot", label: "Gotowanie", category: "Jedzenie", keywords: ["kuchnia", "posiłek", "jedzenie"] },
  { name: "Bath", label: "Kąpiel", category: "Higiena", keywords: ["higiena", "wanna", "relaks"] },
  { name: "ShowerHead", label: "Prysznic", category: "Higiena", keywords: ["higiena", "mycie"] },
  { name: "Sparkles", label: "Pielęgnacja", category: "Higiena", keywords: ["higiena", "skóra", "twarz"] },
  { name: "BrushCleaning", label: "Szczotkowanie", category: "Higiena", keywords: ["zęby", "szczoteczka", "czyszczenie"] },
  { name: "BookOpen", label: "Czytanie", category: "Nauka", keywords: ["książka", "czytanie", "lektura"] },
  { name: "Book", label: "Książka", category: "Nauka", keywords: ["książka", "czytanie"] },
  { name: "GraduationCap", label: "Nauka", category: "Nauka", keywords: ["studia", "szkoła", "edukacja"] },
  { name: "Brain", label: "Rozwój umysłu", category: "Nauka", keywords: ["nauka", "mózg", "medytacja"] },
  { name: "Languages", label: "Języki", category: "Nauka", keywords: ["nauka", "angielski", "język obcy"] },
  { name: "NotebookPen", label: "Notatki", category: "Nauka", keywords: ["pisanie", "nauka", "dziennik"] },
  { name: "Pencil", label: "Pisanie", category: "Nauka", keywords: ["notatki", "nauka", "ołówek"] },
  { name: "Lightbulb", label: "Pomysł", category: "Nauka", keywords: ["nauka", "inspiracja", "rozwój"] },
  { name: "BriefcaseBusiness", label: "Praca", category: "Praca", keywords: ["praca", "biuro", "obowiązki"] },
  { name: "Laptop", label: "Komputer", category: "Praca", keywords: ["praca", "programowanie", "komputer"] },
  { name: "Calendar", label: "Plan", category: "Praca", keywords: ["kalendarz", "organizacja", "termin"] },
  { name: "Clock", label: "Czas", category: "Praca", keywords: ["godzina", "praca", "punktualność"] },
  { name: "ListTodo", label: "Zadania", category: "Praca", keywords: ["lista", "praca", "todo"] },
  { name: "WalletCards", label: "Budżet", category: "Finanse", keywords: ["finanse", "portfel", "pieniądze"] },
  { name: "PiggyBank", label: "Oszczędzanie", category: "Finanse", keywords: ["finanse", "oszczędności", "skarbonka"] },
  { name: "CircleDollarSign", label: "Pieniądze", category: "Finanse", keywords: ["finanse", "zarobki", "oszczędności"] },
  { name: "CreditCard", label: "Wydatki", category: "Finanse", keywords: ["finanse", "karta", "płatność"] },
  { name: "House", label: "Dom", category: "Dom", keywords: ["dom", "porządek"] },
  { name: "BedDouble", label: "Sypialnia", category: "Dom", keywords: ["dom", "łóżko", "sprzątanie"] },
  { name: "WashingMachine", label: "Pranie", category: "Dom", keywords: ["dom", "ubrania", "porządek"] },
  { name: "ShoppingCart", label: "Zakupy", category: "Dom", keywords: ["dom", "sklep", "lista zakupów"] },
  { name: "Users", label: "Ludzie", category: "Relacje", keywords: ["rodzina", "znajomi", "bliscy"] },
  { name: "UserRound", label: "Bliska osoba", category: "Relacje", keywords: ["relacje", "rodzina", "przyjaciel"] },
  { name: "HeartHandshake", label: "Wsparcie", category: "Relacje", keywords: ["relacje", "pomoc", "życzliwość"] },
  { name: "MessageCircle", label: "Rozmowa", category: "Relacje", keywords: ["relacje", "rozmowa", "kontakt"] },
  { name: "Phone", label: "Telefon", category: "Relacje", keywords: ["relacje", "rozmowa", "zadzwonić"] },
  { name: "Flower2", label: "Uważność", category: "Uważność", keywords: ["mindfulness", "relaks", "spokój"] },
  { name: "Leaf", label: "Natura", category: "Uważność", keywords: ["uważność", "spokój", "roślina"] },
  { name: "CloudSun", label: "Spokój", category: "Uważność", keywords: ["relaks", "pogoda", "uważność"] },
  { name: "Music", label: "Muzyka", category: "Hobby", keywords: ["hobby", "instrument", "słuchanie"] },
  { name: "Headphones", label: "Słuchanie", category: "Hobby", keywords: ["muzyka", "podcast", "hobby"] },
  { name: "Camera", label: "Fotografia", category: "Hobby", keywords: ["zdjęcia", "aparat", "hobby"] },
  { name: "Gamepad2", label: "Gry", category: "Hobby", keywords: ["gra", "granie", "hobby"] },
  { name: "Palette", label: "Sztuka", category: "Hobby", keywords: ["rysowanie", "malowanie", "hobby"] },
  { name: "Guitar", label: "Gitara", category: "Hobby", keywords: ["muzyka", "instrument", "ćwiczenia"] },
  { name: "Star", label: "Gwiazda", category: "Inne", keywords: ["ulubione", "cel"] },
  { name: "Flame", label: "Seria", category: "Inne", keywords: ["streak", "motywacja", "ogień"] },
  { name: "Zap", label: "Energia", category: "Inne", keywords: ["energia", "moc", "szybko"] },
  { name: "CircleCheck", label: "Wykonane", category: "Inne", keywords: ["zadanie", "check", "nawyk"] },
  { name: "Flag", label: "Cel", category: "Inne", keywords: ["postęp", "zadanie", "koniec"] },
  { name: "Gift", label: "Nagroda", category: "Inne", keywords: ["nagroda", "prezent", "motywacja"] },
  { name: "MapPin", label: "Miejsce", category: "Inne", keywords: ["lokalizacja", "miejsce", "spacer"] },
  { name: "Car", label: "Samochód", category: "Inne", keywords: ["auto", "jazda", "dojazd"] },
  { name: "Plane", label: "Podróż", category: "Inne", keywords: ["samolot", "wakacje", "podróż"] },
  ...additionalHabitIconOptions,
];

const categories = [
  "Wszystkie",
  "Zdrowie",
  "Sport",
  "Sen",
  "Jedzenie",
  "Higiena",
  "Nauka",
  "Praca",
  "Finanse",
  "Dom",
  "Relacje",
  "Uważność",
  "Hobby",
  "Podróże",
  "Technologia",
  "Narzędzia",
  "Zwierzęta",
  "Inne",
] as const;

type Props = {
  visible: boolean;
  selectedIcon?: HabitIconName | null;
  onSelect: (icon: HabitIconName) => void;
  onClose: () => void;
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getHabitIconLabel(
  icon: HabitIconName | string | LegacyHabitIcon
) {
  if (typeof icon !== "string") {
    return icon.name || icon.icon || "Ikona";
  }

  return (
    iconOptions.find((option) => option.name === icon)?.label ??
    icon
  );
}

export function getSelectedHabitIconName(
  icon: HabitIconName | string | LegacyHabitIcon
): HabitIconName | null {
  return typeof icon === "string" && isHabitIconName(icon)
    ? icon
    : null;
}

export default function HabitIconPicker({
  visible,
  selectedIcon,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const columns =
    width >= 900 ? 7 : width >= 600 ? 6 : width >= 420 ? 5 : 4;
  const itemWidth =
    columns === 7
      ? "13%"
      : columns === 6
        ? "15%"
        : columns === 5
          ? "18%"
          : "23%";
  const styles = createStyles(colors, itemWidth);
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Wszystkie");

  const filteredIcons = useMemo(() => {
    const query = normalize(search.trim());

    return iconOptions.filter((option) => {
      const matchesCategory =
        category === "Wszystkie" ||
        option.category === category;
      const searchable = normalize(
        [option.name, option.label, option.category, ...option.keywords].join(" ")
      );

      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [category, search]);

  const closePicker = () => {
    setSearch("");
    setCategory("Wszystkie");
    onClose();
  };

  const selectIcon = (icon: HabitIconName) => {
    onSelect(icon);
    closePicker();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closePicker}
    >
      <View style={styles.modal}>
        <Pressable
          style={styles.backdrop}
          onPress={closePicker}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Wybierz ikonę</Text>
              <Text style={styles.subtitle}>
                Wyszukaj po nazwie lub słowie kluczowym
              </Text>
            </View>
            <Pressable
              onPress={closePicker}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Zamknij wybór ikony"
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Np. siłownia, woda, książka, sen..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              accessibilityLabel="Szukaj ikon"
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                style={styles.clearButton}
                accessibilityRole="button"
                accessibilityLabel="Wyczyść wyszukiwanie"
              >
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((item) => {
              const selected = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryButton,
                    selected && styles.categoryButtonSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {filteredIcons.length > 0 ? (
              <View style={styles.iconGrid}>
                {filteredIcons.map((option) => {
                  const selected = selectedIcon === option.name;
                  return (
                    <Pressable
                      key={option.name}
                      onPress={() => selectIcon(option.name)}
                      style={[
                        styles.iconItem,
                        selected && styles.iconItemSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                    >
                      <HabitIcon
                        name={option.name}
                        size={25}
                        color={selected ? colors.accent : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.iconName,
                          selected && styles.iconNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nie znaleziono ikony</Text>
                <Text style={styles.emptyText}>
                  Zmień wyszukiwaną frazę lub kategorię.
                </Text>
              </View>
            )}
            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(
  colors: AppThemeColors,
  itemWidth: `${number}%`
) {
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
      backgroundColor: "rgba(15, 15, 20, 0.42)",
    },
    sheet: {
      height: "90%",
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
      paddingHorizontal: 18,
      marginBottom: 14,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "700",
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 3,
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    closeText: {
      color: colors.textSecondary,
      fontSize: 23,
      lineHeight: 25,
    },
    searchBox: {
      minHeight: 48,
      marginHorizontal: 18,
      borderRadius: 13,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 13,
      paddingRight: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      color: colors.text,
      fontSize: 13,
      paddingVertical: 10,
    },
    clearButton: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    clearText: {
      color: colors.textSecondary,
      fontSize: 19,
      lineHeight: 21,
    },
    categoryRow: {
      paddingHorizontal: 18,
      height: 48,
      gap: 6,
      alignItems: "center",
    },
    categoryScroll: {
      height: 48,
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: 10,
    },
    categoryButton: {
      height: 32,
      paddingHorizontal: 11,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryButtonSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    categoryTextSelected: {
      color: colors.accentForeground,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    iconGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      columnGap: 6,
      rowGap: 8,
    },
    iconItem: {
      width: itemWidth,
      minHeight: 78,
      borderRadius: 13,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    iconItemSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    iconName: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "600",
      marginTop: 6,
      textAlign: "center",
      maxWidth: "100%",
    },
    iconNameSelected: {
      color: colors.accent,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 5,
      textAlign: "center",
    },
    bottomSpace: {
      height: 32,
    },
  });
}