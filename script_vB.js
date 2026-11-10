fetch("https://api.open-meteo.com/v1/forecast")
    .then(response => response.json())
    .then(console.log)

https://open-meteo.com/en/docs/dwd-api?hourly=temperature_2m,is_day,weather_code,snowfall,rain,sunshine_duration&daily=weather_code,sunrise,sunset,daylight_duration,sunshine_duration

// ==================================
// 1. API-Einstellungen
// ==================================

const latitude = 53.70;
const longitude = 10.00;

const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
);

const params = {
    latitude: latitude,
    longitude: longitude,

    current: [
        "temperature_2m",
        "relative_humidity_2m",
        "weather_code",
        "wind_speed_10m"
    ],

    daily: [
        "weather_code",
        "sunrise",
        "sunset",
        "daylight_duration",
        "sunshine_duration"
    ],

    hourly: [
        "temperature_2m",
        "is_day",
        "weather_code",
        "snowfall",
        "rain",
        "sunshine_duration"
    ],

    models: "dwd_icon_seamless",
    forecast_days: 7,
    timezone: "auto"
};

url.search = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(",") : value
    ])
).toString();


// ==================================
// 2. Wettercodes übersetzen
// ==================================

function getWeatherInfo(code) {

    const weather = {
        0: ["☀️", "Sonnig"],
        1: ["🌤️", "Überwiegend sonnig"],
        2: ["⛅", "Teilweise bewölkt"],
        3: ["☁️", "Bewölkt"],
        45: ["🌫️", "Nebel"],
        48: ["🌫️", "Nebel"],
        51: ["🌦️", "Leichter Nieselregen"],
        53: ["🌦️", "Nieselregen"],
        55: ["🌧️", "Starker Nieselregen"],
        61: ["🌧️", "Leichter Regen"],
        63: ["🌧️", "Regen"],
        65: ["🌧️", "Starker Regen"],
        71: ["❄️", "Leichter Schneefall"],
        73: ["❄️", "Schneefall"],
        75: ["❄️", "Starker Schneefall"],
        80: ["🌦️", "Regenschauer"],
        81: ["🌧️", "Regenschauer"],
        82: ["🌧️", "Starke Regenschauer"],
        95: ["⛈️", "Gewitter"]
    };

    return weather[code] || ["🌡️", "Unbekannt"];
}


// ==================================
// 3. Wetterdaten abrufen
// ==================================

async function loadWeather() {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API-Fehler: " + response.status);
        }

        const data = await response.json();

        console.log("API-Daten:", data);


        // ==================================
        // 4. Aktuelles Wetter anzeigen
        // ==================================

        const current = data.current;

        const info = getWeatherInfo(
            current.weather_code
        );

        document.getElementById("temperature")
            .textContent =
            Math.round(current.temperature_2m) + " °C";

        document.getElementById("weather-icon")
            .textContent = info[0];

        document.getElementById("description")
            .textContent = info[1];

        document.getElementById("humidity")
            .textContent =
            current.relative_humidity_2m + " %";

        document.getElementById("wind")
            .textContent =
            current.wind_speed_10m + " km/h";


        // ==================================
        // 5. 7-Tage-Vorhersage anzeigen
        // ==================================

        const daily = data.daily;

        const container = document.getElementById(
            "forecast-container"
        );

        container.innerHTML = "";

        daily.time.forEach((date, index) => {

            const weatherInfo = getWeatherInfo(
                daily.weather_code[index]
            );

            const day = new Date(
                date + "T12:00:00"
            );

            const dayName = day.toLocaleDateString(
                "de-DE",
                { weekday: "short", day: "2-digit", month: "2-digit" }
            );

            const sunrise = new Date(
                daily.sunrise[index]
            ).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const sunset = new Date(
                daily.sunset[index]
            ).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const sunshineHours = (
                daily.sunshine_duration[index] / 3600
            ).toFixed(1);

            const card = document.createElement("div");

            card.className = "forecast-day";

            card.innerHTML = `
                <h3>${dayName}</h3>

                <div class="icon">
                    ${weatherInfo[0]}
                </div>

                <p>${weatherInfo[1]}</p>

                <p>🌅 ${sunrise}</p>

                <p>🌇 ${sunset}</p>

                <p>☀️ ${sunshineHours} Std.</p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Wetterfehler:", error);

        document.getElementById("description")
            .textContent =
            "Wetterdaten konnten nicht geladen werden.";

        document.getElementById("forecast-container")
            .textContent =
            "Vorhersage momentan nicht verfügbar.";

    }

}


// ==================================
// 6. Funktion starten
// ==================================

loadWeather();


// Alle 10 Minuten aktualisieren

setInterval(loadWeather, 600000);