import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import unum from "../assets/images/unum.jpg";

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      if (params.id) {
        const docRef = doc(db, "events", params.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEvent({ id: snap.id, ...snap.data() });
        }
      }
      setLoading(false);
    };
    fetchEvent();
  }, [params.id]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && params.id) {
        checkIfUserReviewed(u.uid, params.id);
        loadReviews(params.id);
      }
    });
    return unsub;
  }, [params.id]);

  const checkIfUserReviewed = async (uid, eventId) => {
    const q = query(
      collection(db, "reviews"),
      where("eventId", "==", eventId),
      where("userId", "==", uid)
    );
    const snap = await getDocs(q);
    setHasReviewed(!snap.empty);
  };

  const loadReviews = async (eventId) => {
    const q = query(collection(db, "reviews"), where("eventId", "==", eventId));
    const snap = await getDocs(q);
    let total = 0;
    snap.forEach((d) => (total += d.data().rating));
    setReviewCount(snap.size);
    setAverageRating(snap.size > 0 ? total / snap.size : 0);
  };

  const submitReview = async () => {
    if (!user) return Alert.alert("Log In to rate!");
    if (rating === 0) return Alert.alert("Choose the number of stars!");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event?.date || params.date);
    if (eventDate >= today) {
      return Alert.alert("This event isn't over yet!");
    }

    try {
      await addDoc(collection(db, "reviews"), {
        eventId: params.id,
        eventTitle: event?.title || event?.name || event?.eventName || params.title || "Untitled Event",
        userId: user.uid,
        userEmail: user.email || "anonymous",
        rating,
        comment: comment.trim(),
        timestamp: serverTimestamp(),
      });
      Alert.alert("Thank you! The rating was saved.");
      setRating(0);
      setComment("");
      setHasReviewed(true);
      loadReviews(params.id);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((s) => (
      <TouchableOpacity
        key={s}
        onPress={() => !hasReviewed && setRating(s)}
        disabled={hasReviewed}
      >
        <Text style={[styles.star, rating >= s && styles.starSelected]}>
          {rating >= s ? "★" : "☆"}
        </Text>
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ffb703" />
      </View>
    );
  }

  const ev = event || params;
  const imageSource = ev.image?.startsWith("http") ? { uri: ev.image } : unum;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(ev.date);
  const isExpired = eventDate < today;

  return (
    <ScrollView style={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name}>{event.name}</Text>
        <Text style={styles.category}>{ev.category}</Text>
        <Text style={styles.info}>Date: {ev.date}</Text>
        <Text style={styles.info}>Location: {ev.location}</Text>
        <Text style={[styles.status, isExpired && { color: "#ff6b6b" }]}>
          {isExpired ? "Event ended" : "Upcoming event"}
        </Text>
        {reviewCount > 0 && (
          <Text style={styles.averageRating}>
            Average rating: {averageRating.toFixed(1)} ({reviewCount} ratings)
          </Text>
        )}
        <Text style={styles.aboutHeader}>About the event</Text>
        <Text style={styles.aboutText}>{ev.about}</Text>

        {isExpired && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Rate this event</Text>
            <View style={styles.starsContainer}>{renderStars()}</View>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment (optional)..."
              value={comment}
              onChangeText={setComment}
              multiline
              editable={!hasReviewed}
            />
            {!hasReviewed ? (
              <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                <Text style={styles.submitText}>Send rating</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.alreadyReviewed}>
              You have already given a rating!
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  image: { width: "100%", height: 230, marginBottom: 10 },


  content: { paddingHorizontal: 10, paddingTop: 0, paddingBottom: 12 },


  name: { fontSize: 24, fontWeight: "700", color: "#000000ff", marginBottom: 0 },


  category: { color: "#ffb703", fontSize: 14, marginBottom: 0 },

  info: { color: "#444", fontSize: 14, marginBottom: 0 },

  status: { fontSize: 14, fontWeight: "600", marginTop: 4, color: "#2e8b57" },

  averageRating: { fontSize: 16, color: "#ffb703", marginVertical: 6, fontWeight: "600" },

  aboutHeader: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginTop: 8, marginBottom: 4 },
  aboutText: { color: "#333", fontSize: 15, lineHeight: 20, marginTop: 0 },

  reviewSection: { marginTop: 12, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 12 },

  reviewTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  starsContainer: { flexDirection: "row", marginBottom: 8 },
  star: { fontSize: 28, color: "#ddd" },
  starSelected: { color: "#ffb703" },

  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 64,
    textAlignVertical: "top",
    marginBottom: 8,
  },

  submitButton: {
    backgroundColor: "#ffb703",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  submitText: { color: "#fff", fontWeight: "600" },
  alreadyReviewed: { color: "#2e8b57", fontWeight: "600", textAlign: "center", marginTop: 6 },

  backButton: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  backText: { color: "#1a1a1a", fontSize: 16 },
});
