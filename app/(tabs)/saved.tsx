import React, { useState, useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, View, RefreshControl, Button, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotLoggedInBanner from "../../components/NotLoggedInBanner";

interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: number | string;
  price: string;
  organizer: string;
  image?: { uri: string };
  duration?: string;
  status?: string;
}

export default function Saved({ navigation }: { navigation?: any }) {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedEvents = async () => {
    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      const events: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      setSavedEvents(events);
    } catch (error) {
      console.error("Error loading events:", error);
      alert("Failed to load saved events.");
    }
  };

  useEffect(() => {
    loadSavedEvents();
    const unsubscribeFocus = navigation?.addListener?.("focus", () => {
      console.log("Saved screen focused, loading events");
      loadSavedEvents();
    });
    const eventListener = DeviceEventEmitter.addListener("updateSavedEvents", (newSavedEvents: Event[]) => {
      console.log("Received update via DeviceEventEmitter:", newSavedEvents);
      setSavedEvents(newSavedEvents);
    });
    return () => {
      unsubscribeFocus?.();
      eventListener.remove();
    };
  }, [navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedEvents();
    setRefreshing(false);
  };

  const removeEvent = async (eventId: string) => {
    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      let savedEvents: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      savedEvents = savedEvents.filter((event) => event.id !== eventId);
      await AsyncStorage.setItem("savedEvents", JSON.stringify(savedEvents));
      setSavedEvents(savedEvents);
      alert("Event removed successfully!");
      DeviceEventEmitter.emit("updateSavedEvents", savedEvents);
    } catch (error) {
      console.error("Error removing event:", error);
      alert("An error occurred while removing.");
    }
  };

  return (
    <View style={styles.container}>
      <NotLoggedInBanner variant="banner" position="top" />
      <Text style={styles.header}>Saved Events</Text>
      <FlatList
        data={savedEvents}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || "Unknown Name"}</Text>
            <Text style={styles.date}>{item.date || "Unknown Date"}</Text>
            <Text style={styles.location}>{item.location || "Unknown Location"}</Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description || "No description available"}
              </Text>
            )}
            {item.attendees && (
              <Text style={styles.attendees}>
                Attendees: {typeof item.attendees === "number" ? item.attendees.toLocaleString() : item.attendees || "Unknown attendees"}
              </Text>
            )}
            <Text style={styles.price}>{item.price || "Unknown price"}</Text>
            <Text style={styles.organizer}>Organized by: {item.organizer || "Unknown organizer"}</Text>
            <Image
              source={
                item.image && item.image.uri
                  ? item.image
                  : { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
              }
              style={styles.eventImage}
            />
            <Button title="Remove" onPress={() => removeEvent(item.id)} color="#FF0000" />
          </View>
        )}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No events saved yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "#f2f4f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "flex-start",
    color: "#222",
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
  },
  location: {
    fontSize: 14,
    color: "#1f1d1d",
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginTop: 6,
    lineHeight: 16,
  },
  attendees: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    fontWeight: "500",
  },
  price: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 3,
    fontWeight: "600",
  },
  organizer: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
});