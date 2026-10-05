import type { HabitIconName } from "../components/HabitIcon";

export type HabitIconCategory =
  | "Zdrowie"
  | "Sport"
  | "Sen"
  | "Jedzenie"
  | "Higiena"
  | "Nauka"
  | "Praca"
  | "Technologia"
  | "Finanse"
  | "Dom"
  | "Relacje"
  | "Uważność"
  | "Hobby"
  | "Podróże"
  | "Narzędzia"
  | "Zwierzęta"
  | "Rozrywka"
  | "Inne";

export type HabitIconOption = {
  name: HabitIconName;
  label: string;
  category: HabitIconCategory;
  keywords: string[];
};

type IconDefinition = readonly [
  name: HabitIconName,
  label: string,
  ...keywords: string[],
];

function group(
  category: HabitIconCategory,
  definitions: IconDefinition[]
): HabitIconOption[] {
  return definitions.map(([name, label, ...keywords]) => ({
    name,
    label,
    category,
    keywords,
  }));
}

export const additionalHabitIconOptions: HabitIconOption[] = [
  ...group("Zdrowie", [
    ["Accessibility", "Dostępność", "ruch", "zdrowie"],
    ["Ambulance", "Karetka", "pogotowie", "zdrowie"],
    ["Bandage", "Plaster", "uraz", "zdrowie"],
    ["Biohazard", "Bezpieczeństwo", "ochrona", "zdrowie"],
    ["Bone", "Kości", "anatomia", "zdrowie"],
    ["BrainCircuit", "Mózg", "umysł", "zdrowie", "nauka"],
    ["BriefcaseMedical", "Medycyna", "lekarz", "zdrowie"],
    ["Cigarette", "Palenie", "papieros", "rzucanie"],
    ["Dna", "DNA", "geny", "zdrowie"],
    ["Ear", "Słuch", "ucho", "badanie"],
    ["Eye", "Wzrok", "oczy", "badanie"],
    ["EyeClosed", "Odpoczynek oczu", "oczy", "odpoczynek"],
    ["FlaskConical", "Badania", "laboratorium", "zdrowie"],
    ["HandHeart", "Troska", "pomoc", "zdrowie"],
    ["HeartCrack", "Regeneracja", "odpoczynek", "serce"],
    ["HeartMinus", "Serce", "puls", "zdrowie"],
    ["HeartPlus", "Profilaktyka", "serce", "zdrowie"],
    ["Hospital", "Szpital", "lekarz", "zdrowie"],
    ["Microscope", "Mikroskop", "badania", "nauka"],
    ["Radiation", "Ochrona", "bezpieczeństwo", "zdrowie"],
    ["ScanHeart", "Kontrola zdrowia", "badanie", "serce"],
    ["ShieldPlus", "Ochrona zdrowia", "zdrowie", "bezpieczeństwo"],
    ["Syringe", "Szczepienie", "zastrzyk", "zdrowie"],
    ["TestTube", "Badanie", "laboratorium", "zdrowie"],
    ["TestTubes", "Laboratorium", "badania", "nauka"],
    ["ThermometerSun", "Temperatura", "pomiar", "zdrowie"],
  ]),
  ...group("Sport", [
    ["BicepsFlexed", "Siła", "trening", "mięśnie", "siłownia"],
    ["Award", "Wyróżnienie", "osiągnięcie", "sport"],
    ["BowArrow", "Łucznictwo", "cel", "sport"],
    ["CircleGauge", "Tempo", "wynik", "bieganie"],
    ["Medal", "Medal", "osiągnięcie", "sport"],
    ["Mountain", "Góry", "wędrówka", "spacer"],
    ["MoveUpRight", "Postęp", "ruch", "aktywność"],
    ["Ruler", "Pomiar", "wynik", "wzrost"],
    ["Shield", "Ochrona", "sport", "bezpieczeństwo"],
    ["TimerReset", "Interwały", "timer", "trening"],
    ["Volleyball", "Siatkówka", "piłka", "sport"],
    ["Weight", "Waga", "pomiar", "sport"],
    ["Goal", "Cel treningowy", "piłka", "sport"],
  ]),
  ...group("Sen", [
    ["BedSingle", "Łóżko", "sen", "odpoczynek"],
    ["CloudMoon", "Noc", "sen", "wieczór"],
    ["MoonStar", "Spokojny sen", "sen", "noc"],
    ["AlarmClockCheck", "Punktualna pobudka", "budzik", "rano"],
    ["AlarmClockPlus", "Pobudka", "budzik", "wstawanie"],
    ["AlarmClockMinus", "Wcześniejszy sen", "budzik", "odpoczynek"],
  ]),
  ...group("Jedzenie", [
    ["Banana", "Banan", "owoc", "jedzenie"],
    ["Beef", "Mięso", "posiłek", "jedzenie"],
    ["Cake", "Ciasto", "deser", "jedzenie"],
    ["CakeSlice", "Deser", "ciasto", "jedzenie"],
    ["Candy", "Słodycze", "cukier", "jedzenie"],
    ["Carrot", "Marchew", "warzywa", "jedzenie"],
    ["ChefHat", "Gotowanie", "kuchnia", "posiłek"],
    ["Cherry", "Wiśnie", "owoc", "jedzenie"],
    ["Citrus", "Cytrusy", "owoc", "jedzenie"],
    ["Cookie", "Ciastko", "deser", "jedzenie"],
    ["Egg", "Jajka", "śniadanie", "jedzenie"],
    ["EggFried", "Śniadanie", "jajka", "jedzenie"],
    ["Fish", "Ryby", "posiłek", "jedzenie"],
    ["GlassWater", "Szklanka wody", "picie", "nawodnienie"],
    ["Grape", "Winogrona", "owoc", "jedzenie"],
    ["Ham", "Szynka", "posiłek", "jedzenie"],
    ["IceCreamBowl", "Lody", "deser", "jedzenie"],
    ["IceCreamCone", "Lody", "deser", "jedzenie"],
    ["Milk", "Mleko", "napój", "jedzenie"],
    ["Pizza", "Pizza", "posiłek", "jedzenie"],
    ["Salad", "Sałatka", "warzywa", "jedzenie"],
    ["Sandwich", "Kanapka", "posiłek", "jedzenie"],
    ["Soup", "Zupa", "posiłek", "jedzenie"],
    ["Vegan", "Dieta roślinna", "warzywa", "jedzenie"],
    ["Wheat", "Zboża", "pieczywo", "jedzenie"],
    ["Wine", "Napoje", "wino", "picie"],
  ]),
  ...group("Higiena", [
    ["Brush", "Szczotka", "higiena", "pielęgnacja"],
    ["Hand", "Mycie rąk", "higiena", "mycie"],
    ["SprayCan", "Pielęgnacja", "kosmetyki", "higiena"],
    ["Scissors", "Pielęgnacja", "włosy", "higiena"],
    ["Toothbrush", "Zęby", "szczotkowanie", "higiena"],
  ]),
  ...group("Nauka", [
    ["BookCheck", "Przeczytana książka", "czytanie", "książka"],
    ["BookDashed", "Czytanie", "książka", "nauka"],
    ["BookOpenCheck", "Czytanie", "książka", "nauka"],
    ["BookOpenText", "Lektura", "czytanie", "książka"],
    ["BookPlus", "Nowa książka", "czytanie", "nauka"],
    ["BookText", "Notatki z książki", "czytanie", "nauka"],
    ["BookType", "Czytanie", "książka", "nauka"],
    ["BookUser", "Nauka", "książka", "rozwój"],
    ["Library", "Biblioteka", "książki", "nauka"],
    ["Notebook", "Notatnik", "pisanie", "nauka"],
    ["NotebookTabs", "Notatki", "organizacja", "nauka"],
    ["NotebookText", "Dziennik", "notatki", "pisanie"],
    ["Pen", "Pisanie", "długopis", "notatki"],
    ["PenLine", "Pisanie", "dziennik", "nauka"],
    ["PencilLine", "Szkic", "ołówek", "rysowanie"],
    ["ScrollText", "Czytanie", "tekst", "nauka"],
    ["School", "Szkoła", "nauka", "edukacja"],
    ["Telescope", "Astronomia", "kosmos", "nauka"],
  ]),
  ...group("Praca", [
    ["Bell", "Powiadomienie", "praca", "przypomnienie"],
    ["BellRing", "Alarm", "przypomnienie", "praca"],
    ["Briefcase", "Obowiązki", "praca", "biuro"],
    ["CalendarCheck", "Plan dnia", "kalendarz", "praca"],
    ["CalendarCheck2", "Terminy", "kalendarz", "organizacja"],
    ["CalendarDays", "Kalendarz", "plan", "praca"],
    ["CalendarClock", "Planowanie czasu", "kalendarz", "godzina"],
    ["CalendarPlus", "Nowy plan", "kalendarz", "zadanie"],
    ["CheckCheck", "Lista zadań", "wykonane", "praca"],
    ["ClipboardCheck", "Zadanie", "lista", "wykonane"],
    ["ClipboardList", "Lista", "zadanie", "praca"],
    ["ClipboardPen", "Notatki", "zadanie", "pisanie"],
    ["ClipboardType", "Plan", "lista", "praca"],
    ["ClockAlert", "Termin", "czas", "przypomnienie"],
    ["ClockCheck", "Punktualność", "czas", "praca"],
    ["FileCheck", "Dokument", "zadanie", "praca"],
    ["FileClock", "Czas pracy", "dokument", "czas"],
    ["Folder", "Porządek w plikach", "organizacja", "praca"],
    ["Kanban", "Tablica zadań", "plan", "praca"],
    ["Mail", "E-mail", "wiadomość", "praca"],
    ["MessageSquare", "Wiadomość", "kontakt", "praca"],
    ["MessagesSquare", "Komunikacja", "rozmowa", "praca"],
    ["Presentation", "Prezentacja", "spotkanie", "praca"],
    ["Hourglass", "Skupienie", "czas", "praca"],
    ["Pause", "Przerwa", "odpoczynek", "praca"],
    ["Play", "Start zadania", "praca", "nawyk"],
    ["SearchCheck", "Weryfikacja", "kontrola", "praca"],
  ]),
  ...group("Technologia", [
    ["Monitor", "Monitor", "komputer", "praca"],
    ["Mouse", "Komputer", "mysz", "technologia"],
    ["Printer", "Drukowanie", "drukarka", "praca"],
    ["Smartphone", "Telefon", "smartfon", "ekran"],
    ["Tv", "Telewizor", "ekran", "media"],
    ["Save", "Zapis", "plik", "komputer"],
  ]),
  ...group("Finanse", [
    ["Banknote", "Gotówka", "pieniądze", "finanse"],
    ["Bitcoin", "Kryptowaluty", "bitcoin", "finanse"],
    ["Coins", "Oszczędności", "monety", "pieniądze"],
    ["HandCoins", "Budżet", "oszczędzanie", "finanse"],
    ["Landmark", "Bank", "finanse", "budżet"],
    ["Receipt", "Paragon", "wydatki", "zakupy"],
    ["ReceiptText", "Rachunki", "wydatki", "finanse"],
    ["ShoppingBag", "Zakupy", "wydatki", "sklep"],
    ["Wallet", "Portfel", "budżet", "finanse"],
    ["ChartNoAxesCombined", "Wzrost finansów", "wykres", "oszczędności"],
    ["ChartColumn", "Budżet", "wykres", "finanse"],
    ["BadgeDollarSign", "Cel finansowy", "pieniądze", "oszczędzanie"],
  ]),
  ...group("Dom", [
    ["Armchair", "Odpoczynek", "fotel", "dom"],
    ["Broom", "Sprzątanie", "porządek", "dom"],
    ["Building", "Budynek", "dom", "miejsce"],
    ["DoorOpen", "Wyjście", "dom", "poranek"],
    ["Lamp", "Światło", "dom", "wieczór"],
    ["Package", "Paczka", "dom", "dostawa"],
    ["Refrigerator", "Lodówka", "kuchnia", "dom"],
    ["Sofa", "Odpoczynek", "kanapa", "dom"],
    ["Wrench", "Naprawa", "narzędzia", "dom"],
  ]),
  ...group("Relacje", [
    ["Contact", "Kontakt", "relacje", "osoba"],
    ["ContactRound", "Bliska osoba", "rodzina", "relacje"],
    ["HandHelping", "Pomoc", "wsparcie", "relacje"],
    ["Handshake", "Współpraca", "relacje", "umowa"],
    ["Send", "Wiadomość", "kontakt", "relacje"],
    ["UserRoundPlus", "Nowa znajomość", "relacje", "osoba"],
    ["UsersRound", "Rodzina", "znajomi", "relacje"],
    ["MessageSquareHeart", "Miła wiadomość", "bliscy", "relacje"],
  ]),
  ...group("Uważność", [
    ["Cloud", "Chmura", "spokój", "pogoda"],
    ["Flower", "Kwiat", "relaks", "natura"],
    ["Sparkle", "Chwila dla siebie", "uważność", "relaks"],
    ["TreePine", "Las", "natura", "spacer"],
    ["TreeDeciduous", "Natura", "drzewo", "spokój"],
  ]),
  ...group("Hobby", [
    ["AudioLines", "Słuchanie", "muzyka", "podcast"],
    ["BookAudio", "Audiobook", "książka", "słuchanie"],
    ["Clapperboard", "Film", "kino", "hobby"],
    ["Drama", "Teatr", "sztuka", "hobby"],
    ["Film", "Oglądanie filmu", "kino", "hobby"],
    ["Gamepad", "Granie", "gra", "hobby"],
    ["KeyboardMusic", "Instrument", "muzyka", "ćwiczenia"],
    ["Mic", "Śpiew", "muzyka", "mikrofon"],
    ["Piano", "Pianino", "muzyka", "ćwiczenia"],
    ["Puzzle", "Puzzle", "hobby", "układanie"],
    ["Radio", "Radio", "muzyka", "słuchanie"],
    ["Video", "Nagrywanie", "wideo", "hobby"],
    ["PartyPopper", "Świętowanie", "radość", "nagroda"],
  ]),
  ...group("Podróże", [
    ["Backpack", "Plecak", "wycieczka", "podróż"],
    ["Compass", "Kompas", "nawigacja", "wycieczka"],
    ["Earth", "Świat", "podróż", "planeta"],
    ["Luggage", "Bagaż", "wakacje", "podróż"],
    ["Map", "Mapa", "nawigacja", "wycieczka"],
    ["Navigation", "Nawigacja", "trasa", "podróż"],
    ["Sailboat", "Żeglowanie", "woda", "podróż"],
    ["Ship", "Statek", "podróż", "morze"],
    ["TrainFront", "Pociąg", "dojazd", "podróż"],
    ["TramFront", "Tramwaj", "dojazd", "miasto"],
    ["Trees", "Spacer", "las", "natura"],
    ["Tent", "Namiot", "biwak", "wycieczka"],
    ["CarFront", "Jazda samochodem", "auto", "podróż"],
    ["Bus", "Autobus", "dojazd", "podróż"],
    ["Rocket", "Nowy cel", "start", "podróż"],
    ["MapPinned", "Miejsce", "lokalizacja", "podróż"],
    ["Route", "Trasa", "spacer", "dojazd"],
    ["Fuel", "Tankowanie", "samochód", "podróż"],
    ["Hotel", "Nocleg", "wakacje", "podróż"],
    ["TrafficCone", "Bezpieczeństwo", "droga", "jazda"],
  ]),
  ...group("Narzędzia", [
    ["Paintbrush", "Malowanie", "pędzel", "hobby"],
  ]),
  ...group("Zwierzęta", [
    ["PawPrint", "Opieka nad zwierzęciem", "pies", "kot", "spacer"],
  ]),
  ...group("Inne", [
    ["CircleDashed", "Mały krok", "postęp", "nawyk"],
    ["CircleDot", "Punkt", "cel", "nawyk"],
    ["ThumbsUp", "Dobra robota", "motywacja", "postęp"],
  ]),
];