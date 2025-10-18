import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { v4 as uuidv4 } from "react-native-uuid";

const EVENT_TYPES = [
  "Comedy",
  "Food & Drink",
  "Music",
  "Community & Culture",
  "Hobbies & Special Interest",
  "Performing & Visual Arts",
  "Parties",
];

export default function AddEventScreen() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [locationType, setLocationType] = useState("venue");
  const [locationDetails, setLocationDetails] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [attendees, setAttendees] = useState("");
  const [organizedBy, setOrganizedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const [showPicker, setShowPicker] = useState({
    date: false,
    start: false,
    end: false,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleType = (type) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const openPicker = (type) => {
    setShowPicker({ date: false, start: false, end: false, [type]: true });
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closePicker = (type) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowPicker((prev) => ({ ...prev, [type]: false }));
    });
  };

  const slideUp = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert("Missing Information", "Please provide the event name before saving.");
      return;
    }

    try {
      const id = uuidv4?.() || Date.now().toString();

      const newEvent = {
        id,
        name: eventTitle,
        date: date.toDateString(),
        start_time: startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        end_time: endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        location: locationType === "venue" ? locationDetails : locationType,
        price: parseFloat(price) || 0,
        image:
          image ||
          "https://reporteri.net/wp-content/uploads/2020/03/ttt-4.png",
        attendees: parseInt(attendees) || 0,
        organized_by: organizedBy || "Kosovo Basketball Federation",
        duration,
        description,
        types: selectedTypes,
      };

      const fileUri = FileSystem.documentDirectory + "events.json";
      let existingEvents = [];

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        existingEvents = JSON.parse(fileContent);
      }

      existingEvents.push(newEvent);

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(existingEvents, null, 2)
      );

      Alert.alert("Success", `Your event "${eventTitle}" has been saved successfully!`);
      resetFields();
    } catch (error) {
      console.error("❌ Error saving event:", error);
      Alert.alert("Error", `Failed to save the event.\n${error.message}`);
    }
  };

  const resetFields = () => {
    setSelectedTypes([]);
    setEventTitle("");
    setDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setLocationType("venue");
    setLocationDetails("");
    setPrice("");
    setImage("");
    setAttendees("");
    setOrganizedBy("");
    setDuration("");
    setDescription("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.header}>Create Your Event</Text>
        <Text style={styles.subheader}>
          Tell us about your event so we can help you make it great!
        </Text>

        {/* EVENT TYPE */}
        <Text style={styles.label}>What type of events do you host?</Text>
        <View style={styles.chipContainer}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                selectedTypes.includes(type) && styles.chipSelected,
              ]}
              onPress={() => toggleType(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTypes.includes(type) && styles.chipTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* EVENT TITLE */}
        <Text style={styles.label}>What's the name of your event?</Text>
        <TextInput
          style={styles.input}
          placeholder="Event title"
          placeholderTextColor="#777"
          value={eventTitle}
          onChangeText={setEventTitle}
        />

        {/* DATE */}
        <Text style={[styles.label, { marginTop: 20 }]}>Event Date</Text>
        <TouchableOpacity
          style={styles.modernInput}
          onPress={() => openPicker("date")}
        >
          <Text style={styles.inputText}>📅 {date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {/* START TIME */}
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity
          style={styles.modernInput}
          onPress={() => openPicker("start")}
        >
          <Text style={styles.inputText}>
            🕒{" "}
            {startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Text>
        </TouchableOpacity>

        {/* END TIME */}
        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity
          style={styles.modernInput}
          onPress={() => openPicker("end")}
        >
          <Text style={styles.inputText}>
            🕛{" "}
            {endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Text>
        </TouchableOpacity>

        {/* LOCATION */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Where is it located?
        </Text>
        <View style={styles.locationRow}>
          {[
            { key: "venue", label: "Venue" },
            { key: "online", label: "Online event" },
            { key: "tba", label: "To be announced" },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.locationButton,
                locationType === key && styles.locationButtonSelected,
              ]}
              onPress={() => setLocationType(key)}
            >
              <Text
                style={[
                  styles.locationText,
                  locationType === key && styles.locationTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {locationType === "venue" && (
          <>
            <Text style={styles.label}>Venue Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter venue address or details"
              placeholderTextColor="#777"
              value={locationDetails}
              onChangeText={setLocationDetails}
            />
          </>
        )}

        {/* PRICE */}
        <Text style={[styles.label, { marginTop: 20 }]}>Event Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price (e.g., 15)"
          placeholderTextColor="#777"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* IMAGE */}
        <Text style={[styles.label, { marginTop: 20 }]}>Event Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter image URL (optional)"
          placeholderTextColor="#777"
          value={image}
          onChangeText={setImage}
        />

        {/* ATTENDEES */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Expected Attendees
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter attendees (number)"
          placeholderTextColor="#777"
          value={attendees}
          onChangeText={setAttendees}
          keyboardType="numeric"
        />

        {/* ORGANIZED BY */}
        <Text style={[styles.label, { marginTop: 20 }]}>Organized By</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter organizer name"
          placeholderTextColor="#777"
          value={organizedBy}
          onChangeText={setOrganizedBy}
        />

        {/* DESCRIPTION */}
        <Text style={[styles.label, { marginTop: 20 }]}>Event Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Enter event description"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* ADD EVENT */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP PICKER */}
      {Object.entries(showPicker).map(([type, visible]) =>
        visible ? (
          <Modal key={type} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={() => closePicker(type)} />
            <Animated.View style={[styles.modalBox, slideUp]}>
              <View style={styles.handleBar} />
              <Text style={styles.modalTitle}>
                {type === "date"
                  ? "Select Date"
                  : type === "start"
                  ? "Select Start Time"
                  : "Select End Time"}
              </Text>

              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={
                    type === "date"
                      ? date
                      : type === "start"
                      ? startTime
                      : endTime
                  }
                  mode={type === "date" ? "date" : "time"}
                  display="spinner"
                  is24Hour={true}
                  onChange={(e, value) => {
                    if (value) {
                      if (type === "date") setDate(value);
                      if (type === "start") setStartTime(value);
                      if (type === "end") setEndTime(value);
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => closePicker(type)}
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </Animated.View>
          </Modal>
        ) : null
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: "700", color: "#000", marginTop: 10 },
  subheader: { color: "#333", fontSize: 15, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 10 },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: "#4E73DF" },
  chipText: { fontSize: 14, color: "#000" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#000",
  },
  modernInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputText: { fontSize: 15, color: "#333" },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
  },
  locationButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  locationButtonSelected: { backgroundColor: "#4E73DF" },
  locationText: { color: "#000", fontWeight: "500" },
  locationTextSelected: { color: "#fff", fontWeight: "700" },
  addButton: {
    backgroundColor: "#4E73DF",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4E73DF",
    textAlign: "center",
    marginBottom: 10,
  },
  doneButton: {
    backgroundColor: "#4E73DF",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
