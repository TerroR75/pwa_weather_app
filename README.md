# 🌤️ Pogoda PWA – projekt na "Technologie i aplikacje mobilne"

Progressive Web App pokazująca aktualną pogodę dla dowolnego miasta.  
Działa offline, można zainstalować na Androidzie jak natywna apka.

---

## 📱 Jak zainstalować na Androidzie

1. Otwórz stronę w **Chrome na Androidzie**
2. Chrome zapyta czy zainstalować – kliknij przycisk **"Zainstaluj"**
3. Apka pojawi się na ekranie głównym jak normalna aplikacja
4. Działa w trybie offline (wyświetla ostatnio pobrane dane)

---

## 🏗️ Struktura projektu

```
pwa-weather/
├── index.html          # Główna strona
├── manifest.json       ← PWA manifest (nazwa, ikony, kolory)
├── sw.js               ← Service Worker (offline, cache)
├── css/
│   └── style.css
├── js/
│   └── app.js          # Logika apki
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 🔑 Kluczowe koncepty PWA (do prezentacji)

| Cecha              | Jak to działa w tej apce                                             |
| ------------------ | -------------------------------------------------------------------- |
| **Instalowalność** | `manifest.json` + Service Worker → przycisk "Zainstaluj" w Chrome    |
| **Praca offline**  | Service Worker cache'uje zasoby, localStorage trzyma ostatnią pogodę |
| **Cache First**    | Statyczne zasoby (HTML, CSS, JS) ładowane z cache                    |
| **Network First**  | API pogodowe – najpierw sieć, potem cache                            |
| **App Shell**      | UI ładuje się błyskawicznie, dane doładowują się po                  |

---

## 🛠️ Użyte technologie

- **Vanilla JS** – bez frameworków, czyste PWA
- **OpenWeatherMap API** – darmowe, 1000 req/dzień
- **Service Worker API** – offline, caching
- **Web App Manifest** – instalacja na Androidzie
- **localStorage** – cache ostatniej pogody

---

## 💡 Co pokazuje to demo (dla prowadzącego)

1. ✅ Instalacja na Androidzie (manifest + SW)
2. ✅ Tryb offline (ostatnie dane z cache)
3. ✅ Responsywny design (wygląda jak natywna apka)
4. ✅ Service Worker (dwie strategie: Cache First / Network First)
5. ✅ Brak App Store – dostęp przez URL
