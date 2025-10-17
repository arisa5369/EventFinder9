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
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState({
    date: false,
    start: false,
    end: false,
  });
  const [locationType, setLocationType] = useState("venue");

  const toggleType = (type) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const handlePickerChange = (key, value) =>
    setShowPicker((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
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

        {/* DATE & TIME */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          When does your event start and end?
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handlePickerChange("date", true)}
        >
          <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showPicker.date && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(e, d) => {
              handlePickerChange("date", false);
              if (d) setDate(d);
            }}
          />
        )}

        <View style={styles.timeRow}>
          {[
            { key: "start", label: "Start", value: startTime, setter: setStartTime },
            { key: "end", label: "End", value: endTime, setter: setEndTime },
          ].map(({ key, label, value, setter }) => (
            <TouchableOpacity
              key={key}
              style={styles.timeButton}
              onPress={() => handlePickerChange(key, true)}
            >
              <Text style={styles.dateButtonText}>
                {label}:{" "}
                {value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              {showPicker[key] && (
                <DateTimePicker
                  value={value}
                  mode="time"
                  display="default"
                  onChange={(e, t) => {
                    handlePickerChange(key, false);
                    if (t) setter(t);
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* LOCATION TYPE */}
        <Text style={[styles.label, { marginTop: 20 }]}>Where is it located?</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 10 },
  subheader: { color: "#aaa", fontSize: 15, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 10 },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: "#4E73DF" },
  chipText: { fontSize: 14, color: "#fff" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  input: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#fff",
  },
  dateButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
  },
  dateButtonText: { fontSize: 15, color: "#fff" },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  timeButton: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
  },
  locationButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#111",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  locationButtonSelected: { backgroundColor: "#4E73DF" },
  locationText: { color: "#fff", fontWeight: "500" },
  locationTextSelected: { color: "#fff", fontWeight: "700" },
});
