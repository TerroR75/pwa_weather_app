// POGODA PWA – app.js
// API: OpenWeatherMap (darmowe konto, 1000 req/dzień)

// API
const API_KEY = "82b53905a388936923e696050a42ccc8";
const API_BASE = "https://api.openweathermap.org/data/2.5/weather";
const CACHE_KEY = "pwa_weather_last";

// DOM refs
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const installBtn = document.getElementById("installBtn");
const offlineBanner = document.getElementById("offlineBanner");
const weatherSection = document.getElementById("weatherSection");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const loadingState = document.getElementById("loadingState");
const errorMsg = document.getElementById("errorMsg");

// === Service Worker registration ===
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("[PWA] SW zarejestrowany:", reg.scope))
      .catch((err) => console.warn("[PWA] SW błąd:", err));
  });
}

// === Offline / Online detection ===
function updateOnlineStatus() {
  if (!navigator.onLine) {
    offlineBanner.classList.remove("hidden");
  } else {
    offlineBanner.classList.add("hidden");
  }
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

// === Install prompt (Android Chrome) ===
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log("[PWA] Instalacja:", outcome);
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installBtn.classList.add("hidden");
  console.log("[PWA] Zainstalowano!");
});

// === Weather fetch ===
async function fetchWeather(city) {
  showState("loading");

  // jeśli offline – próbuj z cache
  if (!navigator.onLine) {
    const cached = loadFromCache();
    if (cached && cached.city.toLowerCase() === city.toLowerCase()) {
      renderWeather(cached.data);
      showState("weather");
      return;
    }
    showError("Brak połączenia i brak danych w cache dla tego miasta.");
    return;
  }

  try {
    const url = `${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
    const res = await fetch(url);

    if (res.status === 401) {
      showError("Nieprawidłowy klucz API.\nOtwórz js/app.js i wstaw swój klucz z openweathermap.org");
      return;
    }
    if (res.status === 404) {
      showError(`Nie znaleziono miasta „${city}"`);
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    saveToCache(city, data);
    renderWeather(data);
    showState("weather");
  } catch (err) {
    // sieć dostępna, ale coś poszło nie tak – sprawdź cache
    const cached = loadFromCache();
    if (cached) {
      renderWeather(cached.data);
      showState("weather");
      offlineBanner.classList.remove("hidden");
    } else {
      showError("Błąd połączenia z API. Sprawdź internet i klucz API.");
    }
    console.error("[PWA] fetch error:", err);
  }
}

// === Render ===
function renderWeather(data) {
  const iconCode = data.weather[0].icon;

  document.getElementById("cityName").textContent = data.name;
  document.getElementById("countryCode").textContent = data.sys.country;
  document.getElementById("tempValue").textContent = Math.round(data.main.temp);
  document.getElementById("conditionText").textContent = data.weather[0].description;
  document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like);
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("windSpeed").textContent = Math.round(data.wind.speed * 3.6);
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("visibility").textContent = data.visibility ? (data.visibility / 1000).toFixed(1) : "–";

  const icon = document.getElementById("weatherIcon");
  icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  icon.alt = data.weather[0].description;

  const now = new Date();
  document.getElementById("updatedAt").textContent =
    `Zaktualizowano: ${now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
}

// === State management ===
function showState(state) {
  weatherSection.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorState.classList.add("hidden");
  loadingState.classList.add("hidden");

  if (state === "weather") weatherSection.classList.remove("hidden");
  if (state === "empty") emptyState.classList.remove("hidden");
  if (state === "error") errorState.classList.remove("hidden");
  if (state === "loading") loadingState.classList.remove("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  showState("error");
}

// === Cache (localStorage) ===
function saveToCache(city, data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ city, data, ts: Date.now() }));
  } catch (e) {
    /* storage pełne */
  }
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// === Event listeners ===
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

// === Init – załaduj ostatnie miasto z cache przy starcie ===
(function init() {
  const cached = loadFromCache();
  if (cached) {
    cityInput.value = cached.city;
    renderWeather(cached.data);
    showState("weather");
    // odśwież dane jeśli online
    if (navigator.onLine) fetchWeather(cached.city);
  }
})();
