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
import events from "../event/events.json"; 

interface RawEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: number;
  price: number;
  organized_by: string;
  image: string;
  duration?: string;
  status?: string;
}


interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: number;
  price: string | number;
  organizer?: string;
  image: string | { uri: string };
  duration?: string;
  status?: string;
}

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

  
  const filteredEvents: Event[] = (events as RawEvent[]).map((event) => ({
    ...event,
    organizer: event.organized_by, 
    image: { uri: event.image }, 
  })).filter((event) => {
    const nameMatch = searchQuery
      ? event.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : true;
    const locationMatch = searchLocation
      ? event.location.toLowerCase().includes(searchLocation.toLowerCase().trim())
      : true;
    return nameMatch && locationMatch;
  });

  const openDetailsModal = (event: RawEvent) => {
    setSelectedEvent({
      ...event,
      organizer: event.organized_by, 
      image: { uri: event.image }, 
    });
    setDetailsModalVisible(true);
    loadSavedEvents();
  };

  const toggleSaveEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      alert("Error: Event cannot be toggled.");
      return;
    }

    try {
      const savedEventsJson = await AsyncStorage.getItem("savedEvents");
      let savedEvents: Event[] = savedEventsJson ? JSON.parse(savedEventsJson) : [];
      const isSaved = savedEvents.some((e) => e.id === selectedEvent.id);

      const eventToSave: Event = {
        ...selectedEvent,
        image: typeof selectedEvent.image === "string" ? { uri: selectedEvent.image } : selectedEvent.image,
        price: typeof selectedEvent.price === "number" ? `${selectedEvent.price}€` : selectedEvent.price,
      };

      if (!isSaved) {
        savedEvents = [...savedEvents, eventToSave];
        await AsyncStorage.setItem("savedEvents", JSON.stringify(savedEvents));
        setSavedEventIds([...savedEventIds, selectedEvent.id]);
        alert("Event saved successfully!");
      } else {
        savedEvents = savedEvents.filter((e) => e.id !== selectedEvent.id);
        await AsyncStorage.setItem("savedEvents", JSON.stringify(savedEvents));
        setSavedEventIds(savedEventIds.filter((id) => id !== selectedEvent.id));
        alert("Event unsaved successfully!");
      }
    } catch (error) {
      console.error("Error toggling event:", error);
      alert("An error occurred while toggling the event.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SpotOn</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.inputTouchable}
        activeOpacity={0.8}
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
      <FlatList<Event>
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        renderItem={({ item }: { item: Event }) => (
          <TouchableOpacity
            onPress={() => openDetailsModal(item as unknown as RawEvent)} // Cast to RawEvent for openDetailsModal
            style={styles.card}
            activeOpacity={0.8}
          >
            <Image
              source={
                typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
              }
              style={styles.eventImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.infoRowCard}>
                <Ionicons name="calendar-outline" size={16} color="#666" style={styles.smallIcon} />
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.infoRowCard}>
                <Ionicons name="location-outline" size={16} color="#666" style={styles.smallIcon} />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <View style={styles.infoRowCard}>
                <Ionicons name="cash-outline" size={16} color="#00b67f" style={styles.smallIcon} />
                <Text style={styles.priceText}>
                  {typeof item.price === "number" ? `${item.price}€` : item.price}
                </Text>
              </View>
              {item.description && (
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              )}
            </View>
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
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
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
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customButton, styles.searchButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
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
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalHeader}>{selectedEvent.name}</Text>
                  <TouchableOpacity onPress={() => setDetailsModalVisible(false)} activeOpacity={0.8}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Image
                  source={
                    typeof selectedEvent.image === "string"
                      ? { uri: selectedEvent.image }
                      : selectedEvent.image || { uri: "https://via.placeholder.com/300x150.png?text=No+Image" }
                  }
                  style={styles.heroImage}
                />
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
                    <Text style={styles.infoText}>
                      Attendees: {selectedEvent.attendees.toLocaleString()}
                    </Text>
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
                {selectedEvent.duration && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={24} color="#666" style={styles.icon} />
                    <Text style={styles.infoText}>Duration: {selectedEvent.duration}</Text>
                  </View>
                )}
                {selectedEvent.status && (
                  <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={24} color="#666" style={styles.icon} />
                    <Text style={styles.infoText}>Status: {selectedEvent.status}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={toggleSaveEvent} style={styles.saveContainer} activeOpacity={0.8}>
                  <Ionicons
                    name={savedEventIds.includes(selectedEvent.id) ? "heart" : "heart-outline"}
                    size={30}
                    color={savedEventIds.includes(selectedEvent.id) ? "#FF0000" : "#666"}
                    style={styles.saveIcon}
                  />
                  <Text style={styles.saveText}>save</Text>
                </TouchableOpacity>
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
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "flex-start",
    color: "#1a1a1a",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputTouchable: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    color: "#999",
    fontSize: 16,
    textAlignVertical: "center",
  },
  subheader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
    color: "#333",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  infoRowCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  smallIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  priceText: {
    fontSize: 14,
    color: "#00b67f",
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginTop: 8,
    lineHeight: 18,
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
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "90%",
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
    flex: 1,
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
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  customButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 6,
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
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
  },
  saveContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  saveIcon: {
    marginBottom: 4,
  },
  saveText: {
    fontSize: 14,
    color: "#666",
    textTransform: "lowercase",
  },
});