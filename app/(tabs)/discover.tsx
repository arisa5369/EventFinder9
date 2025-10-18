import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Button,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Event interface updated to match events.json structure
interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: string;
  price: string | number;
  organizer?: string;
  image: string | { uri: string };
}

// Events from events.json
const trendingEvents: Event[] = [
  {
    id: "1",
    name: "Basketball Championship",
    date: "Nov 20, 2025",
    location: "Prishtina Arena",
    price: 15,
    image: "https://picsum.photos/400/250?1",
  },
  {
    id: "2",
    name: "Rock Festival",
    date: "Dec 5, 2025",
    location: "Skanderbeg Square",
    price: 25,
    image: "https://picsum.photos/400/250?2",
  },
  {
    id: "3",
    name: "Jazz Night",
    date: "Jan 10, 2026",
    location: "Peja Cultural Hall",
    price: 20,
    image: "https://picsum.photos/400/250?3",
  },
];

export default function Discover({ navigation }: { navigation?: any }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedEvents();
    setRefreshing(false);
  };

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

      // Normalize image field for saving
      const eventToSave = {
        ...selectedEvent,
        image: typeof selectedEvent.image === "string" ? { uri: selectedEvent.image } : selectedEvent.image,
        price: typeof selectedEvent.price === "number" ? `${selectedEvent.price}€` : selectedEvent.price,
      };

      if (!savedEvents.some((e) => e.id === selectedEvent.id)) {
        savedEvents = [...savedEvents, eventToSave];
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
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDetailsModal(item)}
            style={styles.card}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.location}>{item.location}</Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            )}
            <Image
              source={
                typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
              }
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
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeader}>Search Events</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Event Name"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Location"
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customButton, styles.searchButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" visible={detailsModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            {selectedEvent ? (
              <>
                <Image
                  source={
                    typeof selectedEvent.image === "string"
                      ? { uri: selectedEvent.image }
                      : selectedEvent.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
                  }
                  style={styles.heroImage}
                />
                <Text style={styles.modalHeader}>{selectedEvent.name}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color="#666" style={styles.icon} />
                  <Text style={styles.infoText}>Date: {selectedEvent.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={24} color="#666" style={styles.icon} />
                  <Text style={styles.infoText}>Location: {selectedEvent.location}</Text>
                </View>
                {selectedEvent.attendees && (
                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={24} color="#666" style={styles.icon} />
                    <Text style={styles.infoText}>Participants: {selectedEvent.attendees}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={24} color="#00b67f" style={styles.icon} />
                  <Text style={styles.infoText}>
                    Price: {typeof selectedEvent.price === "number" ? `${selectedEvent.price}€` : selectedEvent.price}
                  </Text>
                </View>
                {selectedEvent.organizer && (
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={24} color="#666" style={styles.icon} />
                    <Text style={styles.infoText}>Organized by: {selectedEvent.organizer}</Text>
                  </View>
                )}
                {selectedEvent.description && (
                  <>
                    <Text style={styles.descriptionTitle}>Description:</Text>
                    <Text style={styles.description}>{selectedEvent.description}</Text>
                  </>
                )}
              </>
            ) : (
              <Text>Event not found!</Text>
            )}
          </ScrollView>
          <View style={styles.modalButtons}>
            <Button title="Save" onPress={saveEvent} color="#4CAF50" />
            <Button title="Close" onPress={() => setDetailsModalVisible(false)} />
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
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
    width: "90%",
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222",
    textAlign: "center",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: "cover",
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: "cover",
    alignSelf: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  customButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#222",
  },
});