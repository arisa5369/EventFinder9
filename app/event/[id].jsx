"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import events from "./events.json";
import RegisterTickets from "./register";

const colors = {
  dark: {
    text: "#fff",
    background: "#000",
    tint: "#4E73DF",
    icon: "#aaa",
    tabIconDefault: "#aaa",
    tabIconSelected: "#4E73DF",
  },
};

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isRegisterVisible, setIsRegisterVisible] = useState(false); 
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.text}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Event Card */}
      <View style={styles.card}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.details}>📅 {event.date}</Text>
          <Text style={styles.details}>📍 {event.location}</Text>
          <Text style={styles.price}>€ {event.price}</Text>

          {isRegisterVisible ? (
            <RegisterTickets event={event} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setIsRegisterVisible(true)}>
              <Text style={styles.buttonText}>Buy Ticket</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    padding: 20,
  },
  text: {
    color: colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    marginBottom: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#1a1a1a", 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333", 
    alignItems: "center",
    width: 100, 
  },
  backButtonText: {
    color: colors.dark.tint,
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#333",
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
    color: colors.dark.icon,
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
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});