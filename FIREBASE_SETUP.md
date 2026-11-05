# Konfiguracja Firebase (logowanie i baza danych)

Aplikacja Habits wymaga Firebase do:
- **Logowania** użytkowników (e-mail + hasło)
- **Synchronizacji danych** między urządzeniami (Firestore)

## Krok 1: Utwórz projekt Firebase

1. Wejdź na https://console.firebase.google.com
2. Kliknij **Utwórz projekt**
3. Wpisz nazwę (np. `Habits`), zaakceptuj warunki
4. Wyłącz Google Analytics (opcjonalnie)
5. Czekaj kilka sekund na utworzenie projektu

## Krok 2: Włącz Email/Password Authentication

1. W Firebase Console: **Authentication** (lub **Build** → **Authentication**)
2. Zakładka **Sign-in method**
3. Kliknij **Email/Password** i włącz opcję
4. Zapisz

## Krok 3: Utwórz Firestore Database

1. **Firestore Database** (lub **Build** → **Firestore Database**)
2. Kliknij **Create database**
3. Lokalizacja: wybierz bliżej Ciebie (np. `europe-west1` dla Polski)
4. Tryb startowy: **Disabled** (zabezpieczenie danych)
5. Czekaj na tworzenie (~1 min)

## Krok 4: Ustaw reguły bezpieczeństwa

1. W Firestore: zakładka **Rules**
2. Zastąp domyślny kod zawartością z pliku `firestore.rules` w repozytorium (główny katalog projektu)
3. Kliknij **Publish**

Reguły zapewniają:
- Każdy użytkownik ma dostęp tylko do swoich danych (`users/{uid}/*`)
- Dane są czytane i pisane tylko po uwierzytelnieniu

## Krok 5: Pobierz konfigurację Web App

1. **Project settings** (ikona koła zębatego u góry)
2. Zakładka **Your apps**
3. Kliknij **Add app** → **Web**
4. Wpisz alias (np. `Habits PWA`)
5. W wyświetlonym kodzie skopiuj obiekt `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "habits-XXXXX.firebaseapp.com",
  projectId: "habits-XXXXX",
  storageBucket: "habits-XXXXX.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Krok 6: Zapisz konfigurację w pliku `.env`

1. W głównym katalogu projektu:
   ```bash
   cp .env.example .env
   ```

2. Otwórz `.env` i uzupełnij wartości z kroku 5:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=habits-XXXXX.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=habits-XXXXX
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=habits-XXXXX.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

3. **Nie udostępniaj tego pliku publicznie**, ale `.env` możesz zacommitować (pliki `.env.local` są w `.gitignore`).

## Krok 7: Zbuduj i wdrożysz

### Lokalnie (teraz)
```bash
cd /home/patryk/projects/Habits
npm install
npx expo export --platform web
```

### Na GitHub (wdrożenie PWA)
```bash
git add .env src/components src/context src/config src/hooks
git commit -m "Configure Firebase"
git push origin main
```

Aplikacja pojawi się na https://patryk1313.github.io/Habits-manager/ (poczekaj kilka minut na GitHub Actions).

## Testowanie

1. Otwórz https://patryk1313.github.io/Habits-manager/
2. Kliknij **Nie masz konta? Zarejestruj się**
3. Załóż konto (e-mail + hasło minimum 6 znaków)
4. Dodaj nawyk, zmień go na innym urządzeniu — zobaczy się na obu

## Rozwiązywanie problemów

**Błąd: "Brak konfiguracji Firebase"**
- Sprawdź, czy `.env` zawiera sześć wartości `EXPO_PUBLIC_FIREBASE_*`
- Zbuduj ponownie: `npx expo export --platform web`
- Odśwież przeglądarkę (Ctrl+F5)

**Błąd: "Operation not allowed" przy rejestracji**
- Wróć do Firebase Console → Authentication → Sign-in method
- Upewnij się, że Email/Password jest **włączona** (zielony przycisk)

**Dane nie zapisują się w chmurze**
- Sprawdź Firestore Rules — czy regułę opublikowałeś (Publish)?
- W Firebase Console → Firestore → Logs — zobacz błędy zapisu

**Logowanie działa, ale dane są puste na innym urządzeniu**
- Upewnij się, że zalogowałeś się na **to samo konto**
- Czekaj kilka sekund na synchronizację z chmury
