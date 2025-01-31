const darkModeToggle = document.querySelector(".toggle-mode");
const themeText = document.querySelector(".themeText");
const timeElement = document.querySelector(".current-time");
const dateElement = document.querySelector(".current-date");
const fiveDayContainer = document.querySelector(".five-day-forecast");
const hourlyContainer = document.querySelector(".hourly-forecast");
const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const cityInfo = document.querySelector(".city-info h2");
const currentTemp = document.querySelector(".current-temp");
const feelsLike = document.querySelector(".feels-like");
const weatherIcon = document.querySelector(".weather-icon");
const weatherMetrics = document.querySelector(".weather-metrics");
const sunriseElement = document.querySelector(".sunrise span");
const sunsetElement = document.querySelector(".sunset span");

const apiKey = "9f49d2b1241fc0b00a6d30ca3f78166e";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5";

darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  themeText.textContent = document.body.classList.contains("dark")
    ? "Dark Mode"
    : "Light Mode";
});

function updateDateTime() {
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  dateElement.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

setInterval(updateDateTime, 1000);
updateDateTime();

async function WeatherData(city) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("City not found");
    return await response.json();
  } catch (error) {
    alert(error.message);
    return null;
  }
}

async function ForecastData(city) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Unable to fetch forecast");
    return await response.json();
  } catch (error) {
    alert(error.message);
    return null;
  }
}

async function updateWeather(city) {
  const weatherData = await WeatherData(city);
  if (!weatherData) return;

  cityInfo.textContent = weatherData.name;
  currentTemp.textContent = `${Math.round(weatherData.main.temp)}°C`;
  feelsLike.textContent = `Feels like: ${Math.round(
    weatherData.main.feels_like
  )}°C`;

  const iconCode = weatherData.weather[0].icon;
  const weatherDescription = weatherData.weather[0].description;
  const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherIcon.innerHTML = ` <img src="${weatherIconUrl}" alt="${weatherDescription} style="width: 50px; height: 50px;" />
  <div class="weather-description">${weatherDescription}</div>`;


  weatherMetrics.innerHTML = `
  <span class="humidity">
      <img src="public/images/humidity.png" alt="Humidity Icon">
      <div class="label" id="label">Humidity: ${weatherData.main.humidity}%</div>
  </span>
  <span class="windSpeed">
      <img src="public/images/wind.png" alt="Wind Speed Icon">
      <div class="label" id="label">Wind Speed: ${weatherData.wind.speed} km/h</div>
  </span>
  <span class="pressure">
      <img src="public/images/pressure-white.png" alt="Pressure Icon">
      <div class="label" id="label">Pressure: ${weatherData.main.pressure} hPa</div>
  </span>
  <span class="uvIndex">
      <img src="public/images/uv-white.png" alt="UV Index Icon">
      <div class="label" id="label">UV Index: ${weatherData.uvIndex}</div>
  </span>
`;

  const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
  const sunsetTime = new Date(weatherData.sys.sunset * 1000);
  const options = { hour: "2-digit", minute: "2-digit" };

  sunriseElement.textContent = `Sunrise: ${sunriseTime.toLocaleTimeString(
    "en-US",
    options
  )}`;
  sunsetElement.textContent = `Sunset: ${sunsetTime.toLocaleTimeString(
    "en-US",
    options
  )}`;

  const forecastData = await ForecastData(city);
  if (forecastData) {
    displayFiveDayForecast(forecastData);
    displayHourlyForecast(forecastData);
  }
}

function displayFiveDayForecast(forecastData) {
  fiveDayContainer.innerHTML = "";

  const weatherIcons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Mist: "🌫️",
    Fog: "🌫️",
  };

  const dailyData = forecastData.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const weatherMain = day.weather[0].main;
    const icon = weatherIcons[weatherMain] || "❓";

    fiveDayContainer.innerHTML += `
      <div class="forecast-item">
        <div class="forecast-day">
        <div class="DayForecast-icon">${icon}</div>
        <div>${Math.round(day.main.temp)}°C</div>
          <span>${date}</span>
        </div>
      </div>`;
  });
}

function displayHourlyForecast(forecastData) {
  hourlyContainer.innerHTML = "";

  const hourlyData = forecastData.list.slice(0, 5);
  hourlyData.forEach((hour) => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const iconCode = hour.weather[0].icon;
    const weatherIcon = `http://openweathermap.org/img/wn/${iconCode}.png`;

    hourlyContainer.innerHTML += `
      <div class="hourly-item">
        <div class="hourly-time">${time}</div>
        <div class="hourly-icon"><img src="${weatherIcon}" alt="weather-icon" /></div>
        <div class="hourly-temp">${Math.round(hour.main.temp)}°C</div>
        <div class="hourly-wind">
        <svg class="wind-icon" id="wind-icon "width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="transform: rotate(${hour.wind.deg || 0}deg)">
<rect width="35" height="35" fill="url(#pattern0_13_403)"/>
<defs>
<pattern id="pattern0_13_403" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_13_403" transform="scale(0.0208333)"/>
</pattern>
<image id="image0_13_403" width="48" height="48" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB5klEQVR4nO2RvUoDQRRGF7GwSy+IubHMKwgGUlvaprS1ThVLq8wNZkZSCUIamxQ+wDYp3DFtXsFKBHeU7CiygkSJcTc7O7O/sN8DXO45x7KqVatWLWzkYdHavxItq6xDR9pAXdsqq33k0gcm/FJWQEfaPwClq0CW9n8BylYBl/ZXAUpTgazY/wNQlgq4Yn8doPAVyJr9fwBFr4Br9oMACluBBNgPBChqBQywHwZQuAokxH4oQNEqYIj9TQCFqUA22N8IUJQKuMF+FADkXSHKfiQAy7lClH0VAMirgop9JQCWUwUV+6oAkHUFVfvKACzjCqr24wBAVhXi2I8FwDKqEMd+XABIu0Jc+7EBWMoV4trXAYC0KujY1wJgKVXQsa8LAElX0LWvDcASrqBr3wQAkqpgYt8IgCVUwcS+KQCYVjC1bwzADCuY2k8CAHQr6Nn3XHS8KXI5IPey0+eLxt7l2y7Ql2Og4rxOxR0w8ZRJBYy0730QLufE8W4G/P2078hmz/e3VG5/QzFxAtQd1KmYAnUXiVYItO/IR+TyFrl3hrP3w2vb37ES2lHP3z4YimadvnaAiRFQMQfmfmpXINwbI5cTwr0uOov2xcyvWRmvMXquNYaiDdTtAhOTOnXHWf9QrVo1K/19Af9KAeOOy4JzAAAAAElFTkSuQmCC"/>
</defs>
</svg>
       <span class="wind-text">Wind: ${hour.wind.speed} km/h</span></div>
      </div>`;
  });
}

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) updateWeather(city);
  }
});

locationButton.addEventListener("click", async () => {
  const city = await getCityFromLocation();
  if (city) updateWeather(city);
});

async function getCityFromLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `${apiBaseUrl}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();
        if (data.name) {
          resolve(data.name);  
        } else {
          reject("Unable to get city from location");
        }
      }, () => reject("Geolocation access denied"));
    } else {
      reject("Geolocation is not supported by your browser.");
    }
  });
}

window.addEventListener("load", async () => {
  const city = await getCityFromLocation();
  if (city) updateWeather(city);
});
