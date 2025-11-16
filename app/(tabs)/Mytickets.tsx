import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Ticket {
  id: string;
  event: {
    name: string;
    image: string;
    date: string;
  };
  quantity: number;
  ticketType: string;
}

const MyTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setError("Ju lutem kyçuni për të parë biletat tuaja.");
        setTickets([]);
        return;
      }

      const eventsQuery = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsQuery);

      const ticketsData: Ticket[] = [];
      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const purchases = eventData.purchases || [];
        const userPurchases = purchases.filter((p: any) => p.userId === user.uid);

        userPurchases.forEach((purchase: any, index: number) => {
          ticketsData.push({
            id: `${eventDoc.id}-${user.uid}-${index}-${purchase.purchaseDate || Date.now()}`,
            event: {
              name: eventData.name,
              image: eventData.image,
              date: eventData.date?.toDate
                ? eventData.date.toDate().toISOString().slice(0, 16).replace("T", " ")
                : eventData.date,
            },
            quantity: purchase.quantity,
            ticketType: purchase.ticketType,
          });
        });
      }

      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTickets([]); 
        setError("Please log in to view your tickets.");
      }
      fetchTickets(); 
    });

    return () => unsubscribe(); 
  }, [fetchTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [fetchTickets]);

  const renderTicket = ({ item }: { item: Ticket }) => (
    <View style={styles.ticketCard}>
      <Image
        source={{ uri: item.event.image || "https://via.placeholder.com/150" }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.ticketDetails}>
        <Text style={styles.eventName}>{item.event.name}</Text>
        <Text style={styles.eventDate}>Date: {item.event.date}</Text>
        <Text style={styles.ticketQuantity}>Tickets Purchased: {item.quantity}</Text>
        <Text style={styles.ticketType}>Type: {item.ticketType}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Tickets</Text>
      {loading ? (
        <Text style={styles.loading}>Loading tickets...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : tickets.length === 0 ? (
        <Text style={styles.noTickets}>You didn't buy a ticket.</Text>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ticketList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  loading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  error: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#d32f2f",
  },
  noTickets: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  ticketList: {
    paddingBottom: 20,
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  eventImage: {
    width: 100,
    height: 100,
  },
  ticketDetails: {
    flex: 1,
    padding: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  ticketQuantity: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 14,
    color: "#333",
  },
});

export default MyTickets;