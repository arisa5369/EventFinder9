import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [date, setDate] = useState(new Date(2025, 10, 25));
  const [startTime, setStartTime] = useState(new Date(2025, 10, 25, 10, 0));
  const [endTime, setEndTime] = useState(new Date(2025, 10, 25, 12, 0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [locationType, setLocationType] = useState("venue");

  const toggleType = (type) => {
    setSelectedTypes(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.illustration}>
          <Text style={styles.emoji}>🎉</Text>
        </View>

        <Text style={styles.title}>Let's get to know you first!</Text>
        <Text style={styles.subtitle}>
          Tell us what kind of events you want to host and we’ll help make it happen.
        </Text>

        <Text style={styles.label}>What type of events do you host?</Text>
        <View style={styles.chipContainer}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, selectedTypes.includes(type) && styles.chipSelected]}
              onPress={() => toggleType(type)}
            >
              <Text style={[styles.chipText, selectedTypes.includes(type) && styles.chipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What's the name of your event?</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#aaa"
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          <Text style={[styles.label, { marginTop: 20 }]}>When does your event start and end?</Text>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <View style={styles.timeRow}>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.dateButtonText}>
                Start: {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.dateButtonText}>
                End: {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
          </View>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(e, selectedTime) => {
                setShowStartTimePicker(false);
                if (selectedTime) setStartTime(selectedTime);
              }}
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={(e, selectedTime) => {
                setShowEndTimePicker(false);
                if (selectedTime) setEndTime(selectedTime);
              }}
            />
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Where is it located?</Text>
          <View style={styles.locationRow}>
            {["venue", "online", "tba"].map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.locationButton, locationType === key && styles.locationButtonSelected]}
                onPress={() => setLocationType(key)}
              >
                <Text style={[styles.locationText, locationType === key && styles.locationTextSelected]}>
                  {key === "venue" ? "Venue" : key === "online" ? "Online event" : "To be announced"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  illustration: { alignItems: "center", marginTop: 10, marginBottom: 20 },
  emoji: { fontSize: 60 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6, color: "#fff" },
  subtitle: { textAlign: "center", fontSize: 15, color: "#ccc", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 8 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { backgroundColor: "#222", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, margin: 5 },
  chipSelected: { backgroundColor: "#4E73DF" },
  chipText: { fontSize: 14, color: "#fff" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  section: { marginTop: 30 },
  input: { backgroundColor: "#111", borderRadius: 8, borderWidth: 1, borderColor: "#444", padding: 12, fontSize: 16, color: "#fff" },
  dateButton: { backgroundColor: "#111", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#444", marginTop: 5 },
  dateButtonText: { fontSize: 15, color: "#fff" },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  timeButton: { flex: 1, backgroundColor: "#111", borderRadius: 8, borderWidth: 1, borderColor: "#444", padding: 12, marginHorizontal: 5 },
  locationRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  locationButton: { flex: 1, borderWidth: 1, borderColor: "#444", borderRadius: 8, paddingVertical: 12, alignItems: "center", backgroundColor: "#111", marginHorizontal: 4 },
  locationButtonSelected: { backgroundColor: "#4E73DF", borderColor: "#4E73DF" },
  locationText: { color: "#fff", fontWeight: "500" },
  locationTextSelected: { color: "#fff", fontWeight: "700" },
});
