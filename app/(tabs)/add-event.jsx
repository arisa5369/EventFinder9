import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
// import both default app and named db & auth export so we can fallback if needed
import app, { db as exportedDb, auth } from "./test-firebase";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

/**
 * Robust coordinate normalizer:
 * Accepts Firestore GeoPoint-like objects { latitude, longitude },
 * objects with lat/lng, string coordinates, arrays [lat, lng], or nested fields.
 */
const normalizeCoordinates = (c) => {
  if (!c) return null;

  // Firestore GeoPoint or simple { latitude: number, longitude: number }
  if (typeof c.latitude === "number" && typeof c.longitude === "number") {
    return { latitude: c.latitude, longitude: c.longitude };
  }

  // lat/lng numbers
  if (typeof c.lat === "number" && typeof c.lng === "number") {
    return { latitude: c.lat, longitude: c.lng };
  }

  // strings parsable to numbers
  if (typeof c.latitude === "string" && typeof c.longitude === "string") {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { latitude: lat, longitude: lng };
  }
  if (typeof c.lat === "string" && typeof c.lng === "string") {
    const lat = parseFloat(c.lat);
    const lng = parseFloat(c.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { latitude: lat, longitude: lng };
  }

  // array [lat, lng]
  if (Array.isArray(c) && c.length >= 2) {
    const lat = parseFloat(c[0]);
    const lng = parseFloat(c[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { latitude: lat, longitude: lng };
  }

  // nested forms
  if (c.coords) return normalizeCoordinates(c.coords);
  if (c.coordinates) return normalizeCoordinates(c.coordinates);
  if (c.location) return normalizeCoordinates(c.location);

  return null;
};

const EVENT_TYPES = [
  "Comedy",
  "Food & Drink",
  "Music",
  "Community & Culture",
  "Hobbies & Special Interest",
  "Performing & Visual Arts",
  "Parties",
];

export default function AddEventScreen({ navigation }) {
  // Create a local firestore instance using exported db or fallback to getFirestore(app)
  const firestoreInstance = exportedDb || getFirestore(app);
  // Diagnostic logs (remove in production)
  console.log("Firestore exportedDb:", exportedDb);
  console.log("Firestore fallback getFirestore(app):", firestoreInstance);
  console.log("Auth export:", auth);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [eventTitle, setEventTitle] = useState("");

  // default start now, end = start + 2h
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const [date, setDate] = useState(now);
  const [startTime, setStartTime] = useState(now);
  const [endTime, setEndTime] = useState(twoHoursLater);

  const [locationType, setLocationType] = useState("venue");
  const [locationDetails, setLocationDetails] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [attendees, setAttendees] = useState("");
  const [organizedBy, setOrganizedBy] = useState("");
  const [description, setDescription] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 42.6629,
    longitude: 21.1655,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [existingEvents, setExistingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    (async () => {
      // 0) Try to ensure anonymous auth first so Firestore rules that require request.auth != null pass
      try {
        if (!auth) {
          console.warn("Auth is undefined — check test-firebase export (should export 'auth').");
        } else if (!auth.currentUser) {
          console.log("No auth.currentUser — attempting anonymous sign-in...");
          await signInAnonymously(auth);
          console.log("Anonymous sign-in succeeded, uid:", auth.currentUser?.uid);
        } else {
          console.log("Already signed in, uid:", auth.currentUser.uid);
        }
      } catch (e) {
        console.error("Anonymous sign-in failed:", e);
        // continue — loadEvents will likely fail with insufficient permissions if auth failed
        // but we surface an alert so you know what's happening
        Alert.alert("Autentikim dështoi", e?.message || "Nuk u arrit autentikimi anonim.");
      }

      // 1) Location permission + current position
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setSelectedLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } else {
          console.warn("Location permission not granted.");
        }
      } catch (err) {
        console.warn("Location permission failed:", err);
      }

      // 2) Load existing events from Firestore
      await loadEvents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate function for clarity + manual refresh
  const loadEvents = async () => {
    if (!firestoreInstance) {
      console.error("Firestore instance is not available. Check ./test-firebase export and initialization.");
      Alert.alert("Gabim", "Firestore nuk është i konfiguruar si duhet (db undefined).");
      setLoadingEvents(false);
      return;
    }

    try {
      console.log("Loading events from Firestore...");
      setLoadingEvents(true);
      const colRef = collection(firestoreInstance, "events");
      console.log("Collection ref:", colRef);

      const snap = await getDocs(colRef);
      console.log("Snapshot size:", snap.size);

      const events = snap.docs.map((d) => {
        const data = d.data() || {};
        console.log("Doc", d.id, data);

        // try a few common locations for coordinate fields
        const coords =
          normalizeCoordinates(data.coordinates) ||
          normalizeCoordinates(data.coords) ||
          normalizeCoordinates(data.location) ||
          null;

        // numeric parsing
        let priceNum = 0;
        if (typeof data.price === "number") priceNum = data.price;
        else if (typeof data.price === "string") {
          const cleaned = data.price.replace(",", ".").trim();
          const p = parseFloat(cleaned);
          priceNum = isNaN(p) ? 0 : p;
        }

        let attendeesNum = 0;
        if (typeof data.attendees === "number") attendeesNum = data.attendees;
        else if (typeof data.attendees === "string") {
          const a = parseInt(data.attendees.trim(), 10);
          attendeesNum = isNaN(a) ? 0 : a;
        }

        return {
          id: d.id,
          name: data.name || data.title || "",
          date: data.date || "",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          location: data.location || data.address || "",
          price: priceNum,
          image: data.image || "",
          attendees: attendeesNum,
          organized_by: data.organized_by || "",
          duration: data.duration || "",
          description: data.description || "",
          types: Array.isArray(data.types) ? data.types : [],
          coordinates: coords,
          createdAt: data.createdAt || "",
        };
      });

      setExistingEvents(events);
      if (events.length === 0) {
        console.log("No events returned - snapshot empty or docs didn't match expected shape.");
      }
    } catch (err) {
      console.error("Error loading events:", err);
      // give the user a readable message
      Alert.alert("Gabim", "Nuk u arrit të ngarkoheshin eventet ekzistuese. Kontrollo console logs.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const toggleType = (t) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // DateTime picker handlers (works both iOS/Android)
  const onChangeDate = (event, selected) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (!selected) return;
    setDate(selected);
  };
  const onChangeStart = (event, selected) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (!selected) return;
    const newStart = new Date(date);
    newStart.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setStartTime(newStart);
    if (newStart >= endTime) {
      const newEnd = new Date(newStart.getTime() + 2 * 60 * 60 * 1000);
      setEndTime(newEnd);
    }
  };
  const onChangeEnd = (event, selected) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (!selected) return;
    const newEnd = new Date(date);
    newEnd.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setEndTime(newEnd);
  };

  const isValidImageUrl = (u) => {
    if (!u || typeof u !== "string") return false;
    return u.startsWith("http://") || u.startsWith("https://");
  };

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const computeDuration = (s, e) => {
    try {
      const diffMs = e.getTime() - s.getTime();
      if (diffMs <= 0) return "0m";
      const minutes = Math.round(diffMs / (1000 * 60));
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    } catch {
      return "";
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert("Mungon Emri", "Ju lutem shkruani emrin e eventit.");
      return;
    }

    const start = new Date(date);
    start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    const end = new Date(date);
    end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (start >= end) {
      Alert.alert("Ora jo valide", "Ora e fillimit duhet të jetë para orës së mbarimit.");
      return;
    }

    const priceClean = (price || "").toString().replace(",", ".").trim();
    const priceNum = parseFloat(priceClean);
    if (price && (isNaN(priceNum) || priceNum < 0)) {
      Alert.alert("Çmim jo valid", "Vendos një çmim valid (shembull: 5 ose 3.5).");
      return;
    }

    const attendeesNum = attendees ? parseInt(attendees.toString().trim(), 10) : 0;
    if (attendees && (isNaN(attendeesNum) || attendeesNum < 0)) {
      Alert.alert("Numër vizitorësh jo valid", "Vendos një numër valid për pritjen e vizitorëve.");
      return;
    }

    const coords =
      selectedLocation && typeof selectedLocation.latitude === "number" && typeof selectedLocation.longitude === "number"
        ? selectedLocation
        : null;

    const imageUrl = isValidImageUrl(image) ? image : "https://reporteri.net/wp-content/uploads/2020/03/ttt-4.png";

    const newEvent = {
      name: eventTitle.trim(),
      date: date.toISOString().split("T")[0],
      start_time: formatTime(start),
      end_time: formatTime(end),
      location: locationType === "venue" ? (locationDetails || "") : locationType,
      price: isNaN(priceNum) ? 0 : priceNum,
      image: imageUrl,
      attendees: isNaN(attendeesNum) ? 0 : attendeesNum,
      organized_by: organizedBy || "Kosovo Basketball Federation",
      duration: computeDuration(start, end),
      description: description || "",
      types: selectedTypes,
      coordinates: coords || { latitude: 0, longitude: 0 },
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(firestoreInstance, "events"), newEvent);
      setExistingEvents((prev) => [...prev, { id: docRef.id, ...newEvent }]);
      Alert.alert("Sukses!", `Eventi "${newEvent.name}" u shtua me sukses!`);
      // reset form (same as before)
      setSelectedTypes([]);
      setEventTitle("");
      setDate(new Date());
      setStartTime(new Date());
      setEndTime(new Date(new Date().getTime() + 2 * 60 * 60 * 1000));
      setLocationType("venue");
      setLocationDetails("");
      setPrice("");
      setImage("");
      setAttendees("");
      setOrganizedBy("");
      setDescription("");
      if (navigation && typeof navigation.navigate === "function") {
        navigation.navigate("Discover");
      }
    } catch (err) {
      console.error("Add event error:", err);
      Alert.alert("Gabim", err?.message || "Diçka shkoi keq duke shtuar eventin.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Krijo Eventin Tënd</Text>
        <Text style={styles.subheader}>
          Na trego për eventin tënd dhe ne do të të ndihmojmë ta bësh të mrekullueshëm!
        </Text>

        <Text style={styles.label}>Çfarë lloji eventi organizon?</Text>
        <View style={styles.chipContainer}>
          {EVENT_TYPES.map((t) => {
            const selected = selectedTypes.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleType(t)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Emri i Eventit</Text>
        <TextInput
          style={styles.input}
          placeholder="Shkruaj emrin e eventit"
          value={eventTitle}
          onChangeText={setEventTitle}
          placeholderTextColor="#777"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Data e Eventit</Text>
        <TouchableOpacity style={styles.modernInput} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <Text style={styles.label}>Ora e Fillimit</Text>
        <TouchableOpacity style={styles.modernInput} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.inputText}>{formatTime(startTime)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={onChangeStart}
          />
        )}

        <Text style={styles.label}>Ora e Mbarimit</Text>
        <TouchableOpacity style={styles.modernInput} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.inputText}>{formatTime(endTime)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker value={endTime} mode="time" display="default" onChange={onChangeEnd} />
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Ku mbahet eventi?</Text>
        <View style={styles.locationRow}>
          {[
            { key: "venue", label: "Venue" },
            { key: "online", label: "Online" },
            { key: "tba", label: "TBA" },
          ].map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[styles.locationButton, locationType === o.key && styles.locationButtonSelected]}
              onPress={() => setLocationType(o.key)}
            >
              <Text style={[styles.locationText, locationType === o.key && styles.locationTextSelected]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {locationType === "venue" && (
          <>
            <Text style={styles.label}>Detajet e Vendit</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresa ose emri i vendit"
              value={locationDetails}
              onChangeText={setLocationDetails}
              placeholderTextColor="#777"
            />
          </>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Zgjidh Lokacionin në Hartë</Text>
        <View style={styles.mapContainer}>
          {loadingEvents ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <MapView
              style={styles.map}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: userLocation?.latitude || 42.6629,
                longitude: userLocation?.longitude || 21.1655,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={!!userLocation}
              onPress={(e) => {
                const coord = e.nativeEvent.coordinate;
                if (coord && typeof coord.latitude === "number" && typeof coord.longitude === "number") {
                  setSelectedLocation(coord);
                }
              }}
            >
              {selectedLocation && (
                <Marker coordinate={selectedLocation} pinColor="blue" title="Event i Ri" />
              )}

              {existingEvents
                .filter((ev) => ev.coordinates && typeof ev.coordinates.latitude === "number" && typeof ev.coordinates.longitude === "number")
                .map((ev) => (
                  <Marker
                    key={ev.id}
                    coordinate={ev.coordinates}
                    title={ev.name}
                    pinColor="red"
                  />
                ))}
            </MapView>
          )}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Çmimi (në €)</Text>
        <TextInput
          style={styles.input}
          placeholder="15"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor="#777"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>URL e Fotos (opsionale)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          value={image}
          onChangeText={setImage}
          placeholderTextColor="#777"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Numri i Pritur i Vizitorëve</Text>
        <TextInput
          style={styles.input}
          placeholder="100"
          value={attendees}
          onChangeText={setAttendees}
          keyboardType="numeric"
          placeholderTextColor="#777"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Organizuar nga</Text>
        <TextInput
          style={styles.input}
          placeholder="Emri i organizatorit"
          value={organizedBy}
          onChangeText={setOrganizedBy}
          placeholderTextColor="#777"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Përshkrimi i Eventit</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Shkruaj diçka për eventin..."
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#777"
          multiline
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>Shto Eventin</Text>
        </TouchableOpacity>

        {/* Optional: a visible button you can use while debugging to reload events */}
        {/* <TouchableOpacity style={[styles.addButton, { backgroundColor: '#888', marginTop: 10 }]} onPress={loadEvents}>
          <Text style={styles.addButtonText}>Reload events (debug)</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: "700", color: "#000", marginTop: 10 },
  subheader: { color: "#666", fontSize: 15, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 10 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  chip: { backgroundColor: "#e0e0e0", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: "#4E73DF" },
  chipText: { fontSize: 14, color: "#000" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  input: { backgroundColor: "#f2f2f2", borderRadius: 10, padding: 14, fontSize: 16, color: "#000", marginBottom: 12 },
  modernInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
    elevation: 2,
  },
  inputText: { fontSize: 15, color: "#333" },
  locationRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  locationButton: { flex: 1, borderRadius: 10, backgroundColor: "#e0e0e0", paddingVertical: 12, alignItems: "center", marginHorizontal: 4 },
  locationButtonSelected: { backgroundColor: "#4E73DF" },
  locationText: { color: "#000", fontWeight: "500" },
  locationTextSelected: { color: "#fff", fontWeight: "700" },
  mapContainer: { height: 250, borderRadius: 12, overflow: "hidden", marginBottom: 20 },
  map: { flex: 1 },
  addButton: { backgroundColor: "#4E73DF", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 20, marginBottom: 40 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});