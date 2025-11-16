import { Link } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import NotLoggedInBanner from "../../components/NotLoggedInBanner";

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(() => {
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    
    const q = query(
      collection(db, "events"),
      where("date", ">=", currentDate.toISOString()), 
      orderBy("date")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Remove duplicates (if any)
        const uniqueEvents = Array.from(
          new Map(list.map((item) => [item.id, item])).values()
        );

        console.log("Upcoming events fetched:", uniqueEvents.map((e) => e.id)); // Debug

        setEvents(uniqueEvents as any[]);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error while receiving events:", error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = fetchEvents();
    return () => unsubscribe();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E73DF" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotLoggedInBanner variant="button" position="top" style={{}} />
      <Text style={styles.title}>Upcoming Events</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          console.log("Rendering Event ID:", item.id); // Debug
          return (
            <Link
              href={{ pathname: "/event/[id]", params: { id: item.id } }}
              asChild
              onPress={() => console.log("Navigating to:", item.id)}
            >
              <TouchableOpacity style={styles.card}>
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/300x180",
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.details}>
                    {item.date} • {item.location}
                  </Text>
                  <Text style={styles.price}>€ {item.price}</Text>
                  {item.quantity !== undefined && (
                    <Text
                      style={[
                        styles.quantityText,
                        item.quantity === 0 && styles.soldOutText,
                      ]}
                    >
                      {item.quantity > 0
                        ? `${item.quantity} remaining tickets`
                        : "Completely sold out"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 50,
              fontSize: 18,
              color: "#666",
            }}
          >
            No upcoming events at the moment.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 20,
    color: "#000",
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4E73DF",
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#27ae60",
  },
  soldOutText: {
    color: "#e74c3c",
  },
});