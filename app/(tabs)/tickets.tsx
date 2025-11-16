import { Link } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase"; 
import NotLoggedInBanner from "../../components/NotLoggedInBanner";

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(list as any[]);
      } catch (e) {
        console.error("Error while retrieving events:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4E73DF" />
        <Text style={{ marginTop: 10 }}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    
      <NotLoggedInBanner
        variant="button"
        position="top"
        style={{}} 
      />

      <Text style={styles.title}>Upcoming Events</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/event/[id]", params: { id: item.id } }}
            asChild
          >
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>
                  Date: {item.date} | Location: {item.location}
                </Text>
                <Text style={styles.price}>€ {item.price}</Text>

                {item.quantity !== undefined && (
                  <Text style={styles.quantityText}>
                    {item.quantity > 0
                      ? `${item.quantity} tickets left`
                      : "Sold Out"}
                  </Text>
                )}
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
    padding: 20,
  },
  title: {
    color: "#000",
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
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  details: {
    color: "#000",
    fontSize: 14,
  },
  price: {
    color: "#4E73DF",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
  },
  quantityText: {
    color: "#e74c3c",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
});