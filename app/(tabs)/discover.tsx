import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";

import {
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const trendingEvents = [
  { id: "1", name: "Tech Conference 2025", location: "Prishtina",image: { uri: "https://via.placeholder.com/300x150.png?text=Tech+Conference" } },
  { id: "2", name: "Summer Music Festival", location: "Peja",  },
  { id: "3", name: "Art Expo", location: "Gjakova",  },
];

export default function Discover() {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const filteredEvents = trendingEvents.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      event.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover Events</Text>

      
      <TouchableOpacity
  onPress={() => setModalVisible(true)}
  style={styles.inputTouchable}
>
  <View style={styles.searchRow}>
    <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
    <Text style={styles.searchText}>Search by name or location...</Text>
  </View>
</TouchableOpacity>

      <Text style={styles.subheader}>Trending Now 🔥</Text>
      <FlatList
        data={filteredEvents.length ? filteredEvents : trendingEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Image source={item.image} style={styles.eventImage} />
          </View>
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
            <Button title="Close" onPress={() => setModalVisible(false)} />
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
  name: { fontSize: 16, fontWeight: "600", color: "#222" },
  location: { fontSize: 14, color: "#1f1d1dff", marginTop: 4 },

 
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
    borderColor: "#131111ff",
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

});
