import React, { useState, useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, View, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Event {
  id: string;
  name: string;
  location: string;
  image?: { uri: string };
}

export default function Saved({ navigation }: { navigation?: any }) {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);

  // Function to load saved events
  const loadSavedEvents = async () => {
    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      console.log("Saved events (JSON):", savedEventsJson);
      const events: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      console.log("Saved events (parsed):", events);
      setSavedEvents(events);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  // Load events when component mounts and when screen is focused
  useEffect(() => {
    loadSavedEvents();
    const unsubscribe = navigation?.addListener?.("focus", loadSavedEvents);
    return unsubscribe;
  }, [navigation]);

  // Function to remove an event
  const removeEvent = async (eventId: string) => {
    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      let savedEvents: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      savedEvents = savedEvents.filter((event) => event.id !== eventId);
      await AsyncStorage.setItem("savedEvents", JSON.stringify(savedEvents));
      setSavedEvents(savedEvents);
      console.log("Event removed, ID:", eventId);
      alert("Event removed successfully!");
    } catch (error) {
      console.error("Error removing event:", error);
      alert("An error occurred while removing.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Events</Text>
      <Button
        title="Refresh"
        onPress={loadSavedEvents}
        color="#2196F3" // Blue color for Refresh button
      />
      {savedEvents.length === 0 ? (
        <Text style={styles.emptyText}>No events saved yet.</Text>
      ) : (
        <FlatList
          data={savedEvents}
          keyExtractor={(item) => {
            console.log("Saved item.id:", item.id);
            return item.id || `fallback-${Math.random()}`;
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name || "Unknown Name"}</Text>
              <Text style={styles.location}>
                {item.location || "Unknown Location"}
              </Text>
              <Image
                source={
                  item.image && item.image.uri
                    ? item.image
                    : { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
                }
                style={styles.eventImage}
              />
              <Button
                title="Remove"
                onPress={() => removeEvent(item.id)}
                color="#FF0000"
              />
            </View>
          )}
        />
      )}
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
  location: {
    fontSize: 14,
    color: "#1f1d1d",
    marginTop: 4,
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