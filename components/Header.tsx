import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" }}
        style={styles.logo}
      />
      <Text style={styles.title}>🎉 Event Finder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  logo: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1976d2" },
});
