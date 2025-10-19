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
} from "react-native";

const events = require("../data/events.json");
const { width } = Dimensions.get("window");

const localImages = {
  "sunnyhill2.jpg": require("../../assets/images/sunnyhill2.jpg"),
  "dokufest.jpg": require("../../assets/images/dokufest.jpg"),
  "etnofest.jpg": require("../../assets/images/etnofest.jpg"),
  "chopin.jpg": require("../../assets/images/chopin.jpg"),
  "unum.jpg": require("../../assets/images/unum.jpg"),
  "speed.jpg": require("../../assets/images/speed.jpg"),
};

const pastStories = [
  {
    id: "a1",
    title: 'Dua Lipa went on stage with her father, Dukagjin Lipa, to perform the song "Era" by the band Gjurmët, moving the audience with this special act.',
    image: require("../../assets/images/dua3.jpg"),
  },
  {
    id: "a2",
    title: "Alban Skënderaj - 'MOTIV' Concert. Due to high demand, tickets for the first night sold out within hours, prompting the addition of three more nights.",
   image: require("../../assets/images/albani.jpg"),
  },
   {
    id: "a3",
    title: 'Shawn Mendes lands in Kosovo for the first time, setting Sunny Hill Festival 2025 on fire with an unforgettable performance!',
    image: require("../../assets/images/shawn1.jpg"),
  },
{
  id: "a4",
  title: 'Old Timers Fest 2024 at Tirana showcased classic cars and incredible stories that amazed every visitor!',
  image: require("../../assets/images/oldtimer.jpg"),
},
{
  id: "a5",
  title: 'The “Verë N’Dimër” festival returns this year in Prishtina with concerts, fairs, cultural activities, and plenty of surprises for all visitors!',
  image: require("../../assets/images/ver.jpg"),
},

];


export default function PastEventsScreen() {
  const router = useRouter();

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/event-details",
          params: {
            title: item.title,
            date: item.date,
            location: item.location,
            category: item.category,
            status: item.status,
            about: item.about,
            image: item.image,
          },
        })
      }
    >
      <ImageBackground
        source={localImages[item.image] || item.image}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.details}>{item.date}</Text>
          <Text style={styles.details}>{item.location}</Text>
          <Text style={styles.status}>{item.status}</Text>
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
      />
      <Text style={styles.storyTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Top Events in the Past</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

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
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
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
  subHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 28,
    marginBottom: 14,
  },
  storyCard: {
    marginBottom: 24,
    borderBottomColor: "#e5e5e5",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  storyImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  storyTitle: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
});
