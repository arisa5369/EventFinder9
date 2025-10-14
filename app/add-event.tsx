import React, { useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Container = Platform.OS === "web" ? View : SafeAreaView;

export default function AddEvent() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>➕ Add New Event</Text>
      <TextInput style={styles.input} placeholder="Event Name" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Event Date" value={date} onChangeText={setDate} />
      <TextInput style={styles.input} placeholder="Event Location" value={location} onChangeText={setLocation} />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save Event</Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1976d2" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 15 },
  button: { backgroundColor: "#1976d2", padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
