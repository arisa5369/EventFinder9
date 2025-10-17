import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Event {
  id: string;
  name: string;
  location: string;
  image?: { uri: string };
}

const trendingEvents: Event[] = [
  {
    id: "1",
    name: "Tech Conference 2025",
    location: "Prishtina",
    image: { 
      uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop" 
    },
  },
  {
    id: "2",
    name: "Summer Music Festival",
    location: "Peja",
    image: { 
      uri: "https://img.freepik.com/premium-photo/crowd-partying-stage-lights-live-concert-summer-music-festival_1168123-55436.jpg?w=400&h=200&fit=crop" 
    },
  },
  {
    id: "3",
    name: "Art Expo",
    location: "Gjakova",
    image: { 
      uri: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=200&fit=crop" 
    },
  },
];

export default function Discover({ navigation }: { navigation?: any }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  const loadSavedEvents = async () => {
    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      const savedEvents: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      const ids = savedEvents.map((event) => event.id);
      setSavedEventIds(ids);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  useEffect(() => {
    loadSavedEvents();
    const unsubscribe = navigation?.addListener?.("focus", loadSavedEvents);
    return unsubscribe;
  }, [navigation]);

  const filteredEvents = trendingEvents.filter((event) => {
    const nameMatch = searchQuery
      ? event.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : true;
    const locationMatch = searchLocation
      ? event.location.toLowerCase().includes(searchLocation.toLowerCase().trim())
      : true;
    return nameMatch && locationMatch;
  });

  const openDetailsModal = (event: Event) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
    loadSavedEvents();
  };

  const saveEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      alert("Error: Event cannot be saved.");
      return;
    }

    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      let savedEvents: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];

      if (!savedEvents.some((e) => e.id === selectedEvent.id)) {
        savedEvents = [...savedEvents, selectedEvent];
        await AsyncStorage.setItem("savedEvents", JSON.stringify(savedEvents));
        setSavedEventIds([...savedEventIds, selectedEvent.id]);
        alert("Event saved successfully!");
      } else {
        alert("Event is already saved!");
      }

      setDetailsModalVisible(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("An error occurred while saving.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SpotOn</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.inputTouchable}
      >
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>
            {searchQuery || searchLocation
              ? `${searchQuery || "Any"} in ${searchLocation || "Any"}`
              : "Search by name or location..."}
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.subheader}>Events</Text>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id || `fallback-${Math.random()}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDetailsModal(item)}
            style={styles.card}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Image
              source={item.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }}
              style={styles.eventImage}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No events found for your search.</Text>
        )}
      />
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Search Events</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Event Name"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              value={searchLocation}
              onChangeText={setSearchLocation}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Search"
                onPress={() => setModalVisible(false)}
              />
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" visible={detailsModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEvent ? (
              <>
                <Text style={styles.modalHeader}>{selectedEvent.name}</Text>
                <Text style={styles.location}>
                  Location: {selectedEvent.location}
                </Text>
                <Image
                  source={selectedEvent.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }}
                  style={styles.eventImage}
                />
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={saveEvent} color="#4CAF50" />
                  <Button
                    title="Close"
                    onPress={() => setDetailsModalVisible(false)}
                  />
                </View>
              </>
            ) : (
              <Text>Event not found!</Text>
            )}
          </View>
        </View>
      </Modal>
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
  inputTouchable: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchText: {
    color: "#999",
    fontSize: 16,
    textAlignVertical: "center",
  },
  subheader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
    color: "#333",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#131111",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: "cover",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});