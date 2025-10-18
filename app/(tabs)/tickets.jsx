import { Link } from "expo-router";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import events from "../event/events.json";

const colors = {
  dark: {
    text: "#000",
    background: "#fff",
    tint: "#4E73DF",
    icon: "#aaa",
    tabIconDefault: "#aaa",
    tabIconSelected: "#4E73DF",
  },
};

export default function EventsList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/event/[id]", params: { id: item.id } }} asChild>
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>
                  📅 {item.date} | 📍 {item.location}
                </Text>
                <Text style={styles.price}>€ {item.price}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 40,
  },
  title: {
    color: colors.dark.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#dfdfdfff",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    color: colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  details: {
    color: colors.dark.text,
    fontSize: 14,
  },
  price: {
    color: colors.dark.tint,
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
  },
});