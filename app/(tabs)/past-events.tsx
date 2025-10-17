import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function PastEventsScreen() {
  const [events] = useState([
    {
      id: "1",
      title: "ARD Athletics Club’s Fast & Scenic 3 Vlei Race 2024",
      category: "RUNNING",
      date: "16 Mar 2024",
      location: "Fairmount High School",
      status: "Expired",
      image: "https://picsum.photos/600/400?random=11",
    },
    {
      id: "2",
      title: "AVBOB Tygerberg 30km 2025",
      category: "RUNNING",
      date: "16 Mar 2025",
      location: "Western Cape",
      status: "Expired",
      image: "https://picsum.photos/600/400?random=22",
    },
    {
      id: "3",
      title: "City Marathon 2023",
      category: "RUNNING",
      date: "22 Oct 2023",
      location: "New York",
      status: "Expired",
      image: "https://picsum.photos/600/400?random=33",
    },
  ]);

  const [pastStories] = useState([
    {
      id: "a1",
      title: "The Annual Charity Run That Changed the City Spirit",
      image: "https://picsum.photos/600/400?random=44",
    },
    {
      id: "a2",
      title: "A Look Back at 2024’s Most Iconic Sports Moments",
      image: "https://picsum.photos/600/400?random=55",
    },
    {
      id: "a3",
      title: "The Legendary Trail Marathon Through the Alps",
      image: "https://picsum.photos/600/400?random=66",
    },
  ]);

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.details}> {item.date}</Text>
          <Text style={styles.details}>{item.location}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderStory = ({ item }: any) => (
    <View style={styles.storyCard}>
      <Image source={{ uri: item.image }} style={styles.storyImage} />
      <Text style={styles.storyTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SECTION 1: Horizontal Top Events */}
        <Text style={styles.header}>Top Events in the Past</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        {/* SECTION 2: Vertical Past Stories */}
        <Text style={styles.subHeader}>More Past Event Highlights</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 20,
    paddingLeft: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    width: width * 0.75,
    marginRight: 18,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 340,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 16,
  },
  textContainer: {
    padding: 16,
  },
  category: {
    color: "#ffb703",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  details: {
    color: "#ddd",
    fontSize: 13,
    marginBottom: 2,
  },
  status: {
    color: "#ff6b6b",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 6,
  },

  // SECOND SECTION (Stories)
  subHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 28,
    marginBottom: 14,
  },
  storyCard: {
    marginBottom: 24,
    borderBottomColor: "#222",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  storyImage: {
    width: "92%",
    height: 200,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 8,
  },
  storyTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
    marginBottom: 6,
  },
});
