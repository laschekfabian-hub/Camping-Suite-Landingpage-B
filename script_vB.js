
const url = "https://api.open-meteo.com/v1/forecast";

const container = document.getElementById("wetter-container");

// Standort ermitteln
if ("geolocation" in navigator) {

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            ladeWetter(latitude, longitude);

        },

        function(error) {

            console.warn("Standort nicht verfügbar:", error.message);

            // Ersatzstandort Berlin
            ladeWetter(52.52, 13.41);

        }
    );

} else {

    // Falls Browser keine Standortermittlung unterstützt
    ladeWetter(52.52, 13.41);

}


// Wetterdaten laden
function ladeWetter(latitude, longitude) {

    container.innerHTML = "Wetterdaten werden geladen...";

    const params = {

        latitude: latitude,
        longitude: longitude,

        daily: [
            "weather_code",
            "sunrise",
            "sunset",
            "temperature_2m_max",
            "temperature_2m_min",
            "daylight_duration",
            "sunshine_duration",
            "wind_speed_10m_max"
        ],

        hourly: [
            "temperature_2m",
            "rain",
            "dew_point_2m",
            "snowfall"
        ],

        models: "dwd_icon_seamless",
        forecast_days: 7,
        timezone: "auto"
    };

    const apiURL = url + "?" + new URLSearchParams({

        ...params,
        daily: params.daily.join(","),
        hourly: params.hourly.join(",")

    });


    fetch(apiURL)

        .then(response => {

            if (!response.ok) {
                throw new Error("API-Fehler: " + response.status);
            }

            return response.json();

        })

        .then(data => {

            console.log("Wetterdaten:", data);

            const daily = data.daily;

            container.innerHTML = "";

            daily.time.forEach((date, index) => {

                const wetterCode = daily.weather_code[index];
                const maxTemp = daily.temperature_2m_max[index];
                const minTemp = daily.temperature_2m_min[index];
                const sunrise = daily.sunrise[index];
                const sunset = daily.sunset[index];
                const wind = daily.wind_speed_10m_max[index];

                const datum = new Date(date + "T12:00:00");

                const datumText = datum.toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long"
                });

                let wetterBeschreibung = "Unbekannt";

                if (wetterCode === 0) {
                    wetterBeschreibung = "Sonnig";
                } else if ([1, 2].includes(wetterCode)) {
                    wetterBeschreibung = "Teilweise bewölkt";
                } else if (wetterCode === 3) {
                    wetterBeschreibung = "Bewölkt";
                } else if ([45, 48].includes(wetterCode)) {
                    wetterBeschreibung = "Nebel";
                } else if (wetterCode >= 51 && wetterCode <= 67) {
                    wetterBeschreibung = "Regen";
                } else if (wetterCode >= 71 && wetterCode <= 77) {
                    wetterBeschreibung = "Schnee";
                } else if (wetterCode >= 80 && wetterCode <= 82) {
                    wetterBeschreibung = "Regenschauer";
                } else if (wetterCode >= 95) {
                    wetterBeschreibung = "Gewitter";
                }

                const karte = document.createElement("div");

                karte.classList.add("wetter-karte");

                karte.innerHTML = `

                    <h2>${datumText}</h2>

                    <p>${wetterBeschreibung}</p>

                    <div class="temperatur">
                        ${Math.round(minTemp)} °C /
                        ${Math.round(maxTemp)} °C
                    </div>

                    <p>Sonnenaufgang: ${sunrise.split("T")[1]}</p>

                    <p>Sonnenuntergang: ${sunset.split("T")[1]}</p>

                    <p>Wind: ${wind} km/h</p>

                `;

                container.appendChild(karte);

            });

        })

        .catch(error => {

            console.error("Fehler beim Laden:", error);

            container.textContent =
                "Die Wetterdaten konnten nicht geladen werden.";

        });

}
