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
    text: "#000",
    background: "#dfdfdfff",
    tint: "#4E73DF",
    icon: "#aaa",
    tabIconDefault: "#aaa",
    tabIconSelected: "#4E73DF",
    badgeRed: "#e74c3c",
    badgeYellow: "#f1c40f",
    badgeGreen: "#27ae60",
  },
};

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.text}>Event not found</Text>
      </View>
    );
  }

  const getBadgeInfo = () => {
    const status = event.status?.toLowerCase();
    if (!status) return { color: null, icon: "" };

    if (status.includes("soon"))
      return { color: colors.dark.badgeRed, icon: "⏰" };
    if (status.includes("full") || status.includes("few seats"))
      return { color: colors.dark.badgeRed, icon: "⚠️" };
    if (status.includes("limited"))
      return { color: colors.dark.badgeYellow, icon: "⚠️" };
    if (status.includes("open") || status.includes("registration"))
      return { color: colors.dark.badgeGreen, icon: "✅" };

    return { color: colors.dark.badgeGreen, icon: "" };
  };

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

          {/* Status Badge  */}
          {event.status && (
            <View style={[styles.badge, { backgroundColor: getBadgeInfo().color }]}>
              <Text style={styles.badgeText}>
                {getBadgeInfo().icon} {event.status}
              </Text>
            </View>
          )}

          {/* About section */}
          <Text style={styles.aboutTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Always show Buy Ticket button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsRegisterVisible(true)}
          >
            <Text style={styles.buttonText}>Buy Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RegisterTickets Modal */}
      {isRegisterVisible && (
        <RegisterTickets
          event={event}
          onClose={() => setIsRegisterVisible(false)}
        />
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
  text: {
    color: colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.dark.background,
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
    overflow: "hidden",
    shadowColor: "#838282ff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
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
    color: colors.dark.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.dark.tint,
    marginVertical: 12,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  badgeText: {
    color: "#0c0c0cff",
    fontSize: 14,
    fontWeight: "600",
  },
  aboutTitle: {
    fontSize: 18,
    color: colors.dark.text,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#000000ff",
    lineHeight: 22,
    marginBottom: 20,
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
