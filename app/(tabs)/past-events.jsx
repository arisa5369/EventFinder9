import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/index";

const { width } = Dimensions.get("window");

import dua3 from "../../assets/images/dua3.jpg";
import albani from "../../assets/images/albani.jpg";
import shawn1 from "../../assets/images/shawn1.jpg";
import oldtimer from "../../assets/images/oldtimer.jpg";
import ver from "../../assets/images/ver.jpg";
import unum from "../../assets/images/unum.jpg";

const pastStories = [
  {
    id: "a1",
title: "Dua Lipa took to the stage with her father, Dukagjin Lipa, to sing the song 'Era' by the band Gjurmët, touching everyone's hearts.",  
  image: dua3,
  },
  {
    id: "a2",
title: "Alban Skënderaj - 'MOTIV' Concert. Due to high demand, tickets were sold out within a few hours, adding three more nights.",
    image: albani,
  },
  {
    id: "a3",
title: "Shawn Mendes comes to Kosovo for the first time and lights up Sunny Hill Festival 2025 with an unforgettable performance!",
    image: shawn1,
  },
  {
    id: "a4",
title: "Old Timers Fest 2024 in Tirana showcased classic cars and incredible stories that amazed every visitor!",  
  image: oldtimer,
  },
  {
    id: "a5",
title: "The 'Summer in Winter' festival returns this year to Prishtina with concerts, fairs, cultural activities and lots of surprises!",
    image: ver,
  },
];

export default function PastEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastEvents = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate < today; 
          });

        setEvents(pastEvents);
      } catch (error) {
        console.error("Gabim: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPastEvents();
  }, []);

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/event-details",
          params: {
            id: item.id,
            title: item.title,
            date: item.date,
            location: item.location,
            category: item.category,
            about: item.about,
            image: item.image,
          },
        })
      }
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
        defaultSource={unum}
      >
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.details}>{item.date}</Text>
          <Text style={styles.details}>{item.location}</Text>
          <Text style={styles.status}>Përfunduar</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderStory = ({ item }) => (
    <TouchableOpacity style={styles.storyCard}>
      <ImageBackground
        source={item.image}
        style={styles.storyImage}
        imageStyle={{ borderRadius: 12 }}
        defaultSource={unum}
      />
      <Text style={styles.storyTitle} numberOfLines={3}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Past Events</Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#ffb703" />
          </View>
        ) : events.length === 0 ? (
          <Text style={styles.emptyText}>There are no past events at the moment.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEvent}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          />
        )}

        <Text style={styles.subHeader}>Unforgettable Moments</Text>
        <FlatList
          data={pastStories}
          keyExtractor={(item) => item.id}
          renderItem={renderStory}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  loading: { padding: 30, alignItems: "center" },
  card: {
    width: width * 0.75,
    marginRight: 18,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  image: { width: "100%", height: 340, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  textContainer: { padding: 16 },
  category: { color: "#ffb703", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  details: { color: "#ddd", fontSize: 13, marginBottom: 2 },
  status: { color: "#ff6b6b", fontWeight: "600", fontSize: 13, marginTop: 6 },
  subHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  storyCard: {
    marginBottom: 24,
    paddingHorizontal: 20,
    borderBottomColor: "#e0dbdb",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  storyImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 8 },
  storyTitle: { color: "#333", fontSize: 13.5, fontWeight: "600", lineHeight: 19 },
  emptyText: { textAlign: "center", color: "#888", fontStyle: "italic", padding: 20, fontSize: 14 },
});