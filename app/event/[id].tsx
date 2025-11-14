"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import events from "./events.json";
import RegisterTickets from "./register";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  price: number;
  image: string;
  attendees: number;
  organized_by: string;
  duration: string;
  description: string;
  status?: string;
}

interface WeatherData {
  temp: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

interface GeoLocation {
  lat: number;
  lon: number;
}

const colors = {
  dark: {
    text: "#000",
    background: "#dfdfdfff",
    tint: "#4E73DF",
    badgeRed: "#e74c3c",
    badgeYellow: "#f1c40f",
    badgeGreen: "#27ae60",
  },
};

const WEATHER_API_KEY = "c5840effcb321c66c0b264a2936fcc60";
const formatDate = (dateStr: string): string | null => {
  try {
    const months: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const parts = dateStr.trim().split(" ");
    if (parts.length !== 3) return null;

    const month = months[parts[0]];
    const day = parts[1].replace(",", "").padStart(2, "0");
    const year = parts[2];

    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
};
const extractCity = (location: string): string => {
  const cityMap: Record<string, string> = {
    "Prishtina Arena": "Pristina, Kosovo",
    "Prishtina Convention Center": "Pristina, Kosovo",
    "Prishtina City Center": "Pristina, Kosovo",
    "National Theatre of Kosovo": "Pristina, Kosovo",
    "Skanderbeg Square": "Tirana, Albania",
    "Tirana Amphitheatre": "Tirana, Albania",
    "Tirana Downtown": "Tirana, Albania",
    "Peja Cultural Hall": "Peje, Kosovo",
    "Shkodër City Square": "Shkoder, Albania",
  };

  return cityMap[location] || "Pristina, Kosovo";
};
const getWeatherIconColor = (icon: string): string => {
  if (icon.includes("01")) return "#FFD700"; // diell
  if (icon.includes("02") || icon.includes("03")) return "#87CEEB"; // re
  if (icon.includes("09") || icon.includes("10")) return "#4682B4"; // shi
  if (icon.includes("11")) return "#8B0000"; // stuhi
  if (icon.includes("13")) return "#FFFFFF"; // borë
  return "#666";
};
export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const event = useMemo(() => {
    return events.find((e: Event) => e.id === id);
  }, [id]);

  const loadWeather = async () => {
    if (!event) return;

    const isoDate = formatDate(event.date);
    if (!isoDate) {
      setError("Formati i datës është i pasaktë.");
      setLoadingWeather(false);
      return;
    }

    const city = extractCity(event.location);

    try {
      setLoadingWeather(true);
      setError(null);

      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${WEATHER_API_KEY}`;

      const geoRes = await fetch(geoUrl);
      const geoData: GeoLocation[] = await geoRes.json();

      if (!geoData[0]) {
        setError("Qyteti nuk u gjet.");
        return;
      }

      const { lat, lon } = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (!weatherData.list) {
        setError("Të dhënat e motit mungojnë.");
        return;
      }

      const forecast = weatherData.list.find((item: any) =>
        item.dt_txt.startsWith(isoDate)
      );

      if (forecast) {
        setWeather({
          temp: Math.round(forecast.main.temp),
          temp_min: Math.round(forecast.main.temp_min),
          temp_max: Math.round(forecast.main.temp_max),
          description: forecast.weather[0].description,
          icon: forecast.weather[0].icon,
        });
      } else {
        setError("Nuk ka parashikim për këtë ditë.");
      }
    } catch (err) {
      setError("Lidhja me API-në e motit dështoi.");
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [event]);

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.details}>Date: {event.date}</Text>
          <Text style={styles.details}>Location: {event.location}</Text>

         
          <View style={styles.weatherContainer}>
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherTitle}>Weather for the day of the event</Text>
              <TouchableOpacity onPress={loadWeather} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loadingWeather ? (
              <ActivityIndicator size="small" color={colors.dark.tint} />
            ) : error ? (
              <Text style={styles.weatherError}>{error}</Text>
            ) : weather ? (
              <View style={styles.weatherInfo}>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
                  }}
                  style={[
                    styles.weatherIcon,
                    { tintColor: getWeatherIconColor(weather.icon) },
                  ]}
                />

                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.currentTemp}>{weather.temp}°C</Text>
                  <Text style={styles.minMax}>
                    Min {weather.temp_min}°C • Max {weather.temp_max}°C
                  </Text>
                  <Text style={styles.description}>{weather.description}</Text>
                </View>
              </View>
            ) : null}
          </View>

          <Text style={styles.price}>€ {event.price}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsRegisterVisible(true)}
          >
            <Text style={styles.buttonText}>Buy Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isRegisterVisible && (
        <RegisterTickets event={event} onClose={() => setIsRegisterVisible(false)} />
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9b9b9bff",
    alignItems: "center",
    width: 100,
  },
  backButtonText: {
    color: colors.dark.tint,
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.dark.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 250,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark.text,
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.dark.tint,
    marginVertical: 12,
  },
  button: {
    backgroundColor: colors.dark.tint,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  /* MOTI */
  weatherContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: colors.dark.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    width: 60,
    height: 60,
  },
  currentTemp: {
    fontSize: 28,
    fontWeight: "700",
  },
  minMax: {
    fontSize: 14,
    color: "#555",
  },
  weatherError: {
    color: "red",
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#555",
    textTransform: "capitalize",
    marginTop: 4,
},

});
