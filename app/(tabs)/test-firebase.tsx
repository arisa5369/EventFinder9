import { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function TestFirebaseScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      Alert.alert("Gabim", "Firebase Auth nuk është i inicializuar!");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        Alert.alert("SUKSES", `Përdorues i kyçur: ${user.uid}`);
      } else {
        Alert.alert("Lidhja funksionon!", "Firebase është i lidhur, por asnjë përdorues nuk është i kyçur.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Po lidhet me Firebase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Firebase</Text>
      <Text style={styles.subtitle}>Lidhja u verifikua automatikisht!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});