import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const images = {
  "sunnyhill2.jpg": require("../assets/images/sunnyhill2.jpg"),
  "dokufest.jpg": require("../assets/images/dokufest.jpg"),
  "etnofest.jpg": require("../assets/images/etnofest.jpg"),
  "chopin.jpg": require("../assets/images/chopin.jpg"),
  "unum.jpg": require("../assets/images/unum.jpg"),
   "speed.jpg": require("../assets/images/speed.jpg"),
      "chopin.jpg": require("../assets/images/chopin.jpg")

};


export default function EventDetailsScreen() {
  const router = useRouter();
  const { title, date, location, category, status, about, image } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Image source={images[image] || images.default} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.info}>📅 {date}</Text>
        <Text style={styles.info}>📍 {location}</Text>
        <Text style={styles.status}>
          {status === "Expired" ? "Event Finished" : status}
        </Text>
        <Text style={styles.aboutHeader}>About this event</Text>
        <Text style={styles.aboutText}>{about}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    color: "#1a1a1a", 
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  category: {
    color: "#ffb703",
    fontSize: 14,
    marginBottom: 6,
  },
  info: {
    color: "#444", 
    fontSize: 14,
    marginBottom: 2,
  },
  status: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 8,
  },
  aboutHeader: {
    color: "#1a1a1a", 
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  aboutText: {
    color: "#333",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  backButton: {
    marginTop: 28,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  backText: {
    color: "#1a1a1a",
    fontSize: 16,
  },
});
