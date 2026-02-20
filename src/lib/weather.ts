// Weather fetching for Shropshire using Open-Meteo API (free, no API key)
// Shropshire coordinates: 52.71°N, 2.75°W

const SHROPSHIRE_LAT = 52.71;
const SHROPSHIRE_LON = -2.75;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface WeatherData {
  temperature: number; // °C
  weatherCode: number;
  icon: string;
  description: string;
  fetchedAt: number;
}

// WMO Weather interpretation codes → icon + description
function interpretWeatherCode(code: number): { icon: string; description: string } {
  // https://open-meteo.com/en/docs — WMO Weather interpretation codes
  if (code === 0) return { icon: "☀️", description: "Clear sky" };
  if (code === 1) return { icon: "🌤️", description: "Mainly clear" };
  if (code === 2) return { icon: "⛅", description: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", description: "Overcast" };
  if (code === 45 || code === 48) return { icon: "🌫️", description: "Foggy" };
  if (code === 51 || code === 53 || code === 55) return { icon: "🌦️", description: "Drizzle" };
  if (code === 56 || code === 57) return { icon: "🌧️", description: "Freezing drizzle" };
  if (code === 61) return { icon: "🌧️", description: "Light rain" };
  if (code === 63) return { icon: "🌧️", description: "Moderate rain" };
  if (code === 65) return { icon: "🌧️", description: "Heavy rain" };
  if (code === 66 || code === 67) return { icon: "🌧️", description: "Freezing rain" };
  if (code === 71) return { icon: "🌨️", description: "Light snow" };
  if (code === 73) return { icon: "🌨️", description: "Moderate snow" };
  if (code === 75) return { icon: "❄️", description: "Heavy snow" };
  if (code === 77) return { icon: "🌨️", description: "Snow grains" };
  if (code === 80 || code === 81 || code === 82) return { icon: "🌦️", description: "Rain showers" };
  if (code === 85 || code === 86) return { icon: "🌨️", description: "Snow showers" };
  if (code === 95) return { icon: "⛈️", description: "Thunderstorm" };
  if (code === 96 || code === 99) return { icon: "⛈️", description: "Thunderstorm with hail" };
  return { icon: "🌡️", description: "Unknown" };
}

let cachedWeather: WeatherData | null = null;

export async function fetchWeather(): Promise<WeatherData> {
  // Return cache if fresh
  if (cachedWeather && Date.now() - cachedWeather.fetchedAt < CACHE_DURATION_MS) {
    return cachedWeather;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${SHROPSHIRE_LAT}&longitude=${SHROPSHIRE_LON}&current=temperature_2m,weather_code&timezone=Europe%2FLondon`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const { icon, description } = interpretWeatherCode(current.weather_code);

    const weather: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      icon,
      description,
      fetchedAt: Date.now(),
    };

    cachedWeather = weather;
    return weather;
  } catch (err) {
    // Return stale cache if available
    if (cachedWeather) return cachedWeather;

    // Fallback
    return {
      temperature: 0,
      weatherCode: -1,
      icon: "⚠️",
      description: "Unavailable",
      fetchedAt: Date.now(),
    };
  }
}
