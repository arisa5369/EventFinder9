import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import { db, auth } from "./firebase/index";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const images = {
  "sunnyhill2.jpg": require("../assets/images/sunnyhill2.jpg"),
  "dokufest.jpg": require("../assets/images/dokufest.jpg"),
  "etnofest.jpg": require("../assets/images/etnofest.jpg"),
  "chopin.jpg": require("../assets/images/chopin.jpg"),
  "unum.jpg": require("../assets/images/unum.jpg"),
  "speed.jpg": require("../assets/images/speed.jpg"),
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const {
    id,
    title,
    date,
    location,
    category,
    status,
    about,
    image,
  } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && id) {
        checkIfUserReviewed(currentUser.uid, id);
        loadReviews(id);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const checkIfUserReviewed = async (uid, eventId) => {
    const q = query(
      collection(db, "reviews"),
      where("eventId", "==", eventId),
      where("userId", "==", uid)
    );
    const snapshot = await getDocs(q);
    setHasReviewed(!snapshot.empty);
  };

  const loadReviews = async (eventId) => {
    const q = query(collection(db, "reviews"), where("eventId", "==", eventId));
    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.forEach((doc) => {
      total += doc.data().rating;
    });
    setReviewCount(snapshot.size);
    setAverageRating(snapshot.size > 0 ? total / snapshot.size : 0);
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert("Kyçuni për të dhënë vlerësim!");
      return;
    }
    if (rating === 0) {
      Alert.alert("Zgjidhni numrin e yjeve!");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        eventId: id,
        eventTitle: title,
        userId: user.uid,
        userEmail: user.email || "anonim",
        rating,
        comment: comment.trim(),
        timestamp: serverTimestamp(),
      });

      Alert.alert("Faleminderit! Vlerësimi u ruajt.");
      setRating(0);
      setComment("");
      setHasReviewed(true);
      loadReviews(id);
    } catch (error) {
      Alert.alert("Gabim", error.message);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => !hasReviewed && setRating(star)}
        disabled={hasReviewed}
      >
        <Text style={[styles.star, rating >= star && styles.starSelected]}>
          {rating >= star ? "★" : "☆"}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={images[image]} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.info}>Date: {date}</Text>
        <Text style={styles.info}>Location: {location}</Text>
        <Text style={styles.status}>
          {status === "Expired" ? "Event Finished" : status}
        </Text>

        {reviewCount > 0 && (
          <Text style={styles.averageRating}>
            Average Rating: {averageRating.toFixed(1)} ({reviewCount} reviews)
          </Text>
        )}

        <Text style={styles.aboutHeader}>About this event</Text>
        <Text style={styles.aboutText}>{about}</Text>

        {status === "Expired" && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Rate This Event</Text>
            <View style={styles.starsContainer}>{renderStars()}</View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment (optional)..."
              value={comment}
              onChangeText={setComment}
              multiline
              editable={!hasReviewed}
            />

            {!hasReviewed ? (
              <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                <Text style={styles.submitText}>Submit Review</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.alreadyReviewed}>You have already reviewed!</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 300 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 },
  category: { color: "#ffb703", fontSize: 14, marginBottom: 6 },
  info: { color: "#444", fontSize: 14, marginBottom: 2 },
  status: { color: "#ff6b6b", fontSize: 14, fontWeight: "600", marginVertical: 8 },
  averageRating: { fontSize: 16, color: "#ffb703", marginVertical: 8, fontWeight: "600" },
  aboutHeader: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginTop: 16 },
  aboutText: { color: "#333", fontSize: 15, lineHeight: 22, marginTop: 6 },

  reviewSection: { marginTop: 24, padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12 },
  reviewTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  starsContainer: { flexDirection: "row", marginBottom: 12 },
  star: { fontSize: 32, color: "#ddd" },
  starSelected: { color: "#ffb703" },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#ffb703",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600" },
  alreadyReviewed: { color: "#2e8b57", fontWeight: "600", textAlign: "center", marginTop: 8 },
  backButton: { marginTop: 32, padding: 12, borderWidth: 1, borderColor: "#333", borderRadius: 10, alignItems: "center" },
  backText: { color: "#1a1a1a", fontSize: 16 },
});