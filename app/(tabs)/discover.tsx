import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import events from "../event/events.json";
import { db, auth } from "../firebase";
import NotLoggedInBanner from "../../components/NotLoggedInBanner";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

import seedEvents from "../event/add-events-to-firestore";

if (__DEV__) {
  seedEvents().catch((err) => console.log("Gabim në seed:", err));
}
interface RawEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: number;
  price: number;
  organized_by: string;
  image: string;
  duration?: string;
  status?: string;
}

interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  description?: string;
  attendees?: number | string;
  price: string | number;
  organizer?: string;
  image: string | { uri: string };
  duration?: string;
  status?: string;
  isFirebase?: boolean;
  ownerId?: string;
}

const { width, height } = Dimensions.get("window");

export default function Discover({ navigation, route }: { navigation?: any; route?: any }) {
  // ========== STATE ==========
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [firebaseEvents, setFirebaseEvents] = useState<Event[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [deletedLocalIds, setDeletedLocalIds] = useState<string[]>([]);
  const [editedLocalEvents, setEditedLocalEvents] = useState<Record<string, Partial<Omit<Event, "id" | "isFirebase">>>>({});
  const [form, setForm] = useState<Omit<Event, "id" | "isFirebase">>({
    name: "",
    location: "",
    date: "",
    price: 0,
    organizer: "",
    image: "https://via.placeholder.com/300x150.png?text=Event",
    description: "",
    duration: "",
    status: "",
  });

  const safeImageSource = useCallback((image: any) => {
    const placeholder = { uri: "https://via.placeholder.com/300x150.png?text=Event" };
    if (!image) return placeholder;
    if (typeof image === "string") {
      const trimmed = image.trim();
      return trimmed ? { uri: trimmed } : placeholder;
    }
    if (typeof image === "object" && (image as any).uri) {
      const uri = (image as any).uri;
      if (typeof uri === "string" && uri.trim()) return { uri: uri.trim() };
      return placeholder;
    }
    return placeholder;
  }, []);


  const loadSavedEvents = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem("savedEvents");
      if (!json) {
        setSavedEventIds([]);
        return;
      }
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === "string") {
          setSavedEventIds(parsed);
        } else {
          setSavedEventIds(parsed.map((e: any) => e.id).filter(Boolean));
        }
      } else {
        setSavedEventIds([]);
      }
    } catch (e) {
      console.error("loadSavedEvents error:", e);
    }
  }, []);

  const loadLocalChanges = useCallback(async () => {
    try {
      const del = await AsyncStorage.getItem("deletedLocalIds");
      const edt = await AsyncStorage.getItem("editedLocalEvents");
      setDeletedLocalIds(del ? JSON.parse(del) : []);
      setEditedLocalEvents(edt ? JSON.parse(edt) : {});
    } catch (e) {
      console.error("loadLocalChanges error:", e);
    }
  }, []);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
      } else {
        signInAnonymously(auth)
          .then(({ user }) => setCurrentUid(user?.uid || null))
          .catch((err) => console.error("Anonymous sign-in failed:", err));
      }
    });
    return () => unsub();
  }, []);

  const ensureSignedIn = async (retries = 2): Promise<string | null> => {
    try {
      if (auth.currentUser) return auth.currentUser.uid;
      const res = await signInAnonymously(auth);
      return res.user?.uid || null;
    } catch (err: any) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 700));
        return ensureSignedIn(retries - 1);
      }
      Alert.alert("Gabim", `Identifikimi dështoi: ${err?.message || err}`);
      return null;
    }
  };


  useEffect(() => {
    loadSavedEvents();
    loadLocalChanges();

    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const placeholder = "https://via.placeholder.com/300x150.png?text=Event";
        const data = snapshot.docs.map((d) => {
          const docData = d.data() as any;
          let dateStr = "";
          if (docData.date instanceof Timestamp) {
            dateStr = docData.date.toDate().toISOString().split("T")[0];
          } else if (typeof docData.date === "string") {
            dateStr = docData.date;
          }
          const ownerId = docData.ownerId || null;

          return {
            id: d.id,
            name: docData.name || "",
            location: docData.location || "",
            date: dateStr,
            description: docData.description || "",
            attendees: docData.attendees ?? 0,
            price: docData.price ?? 0,
            organizer: docData.organized_by || docData.organizer || "",
            image: docData.image ? { uri: docData.image } : { uri: placeholder },
            duration: docData.duration || "",
            status: docData.status || "",
            isFirebase: true,
            ownerId,
          } as Event;
        });
        setFirebaseEvents(data);
      },
      (err) => Alert.alert("Gabim", `Dështoi: ${err?.message || err}`)
    );

    const focusUnsub = navigation?.addListener?.("focus", () => {
      loadSavedEvents();
      loadLocalChanges();
    });

    return () => {
      unsubscribe();
      if (typeof focusUnsub === "function") focusUnsub();
    };
  }, [navigation, loadSavedEvents, loadLocalChanges]);


  useEffect(() => {
    if (route?.params?.newEvent) {
      const newEv = route.params.newEvent;
      setFirebaseEvents((prev) => {
        if (prev.some((e) => e.id === newEv.id)) return prev;
        return [...prev, newEv];
      });
      navigation.setParams({ newEvent: undefined });
    }
  }, [route?.params?.newEvent, navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadSavedEvents(), loadLocalChanges()]);
    setRefreshing(false);
  }, [loadSavedEvents, loadLocalChanges]);

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      location: "",
      date: "",
      price: 0,
      organizer: "",
      image: "https://via.placeholder.com/300x150.png?text=Event",
      description: "",
      duration: "",
      status: "",
    });
  }, []);


  const handleCreate = useCallback(async () => {
    if (!form.name || !form.location || !form.date) {
      Alert.alert("Gabim", "Plotëso fushat e detyrueshme!");
      return;
    }
    const uid = currentUid || (await ensureSignedIn());
    if (!uid) return;

    const payload: any = {
      ...form,
      price: Number(form.price) || 0,
      organized_by: form.organizer,
      image: typeof form.image === "string" ? form.image : (form.image as any).uri,
      ownerId: uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "events"), payload);
      Alert.alert("Sukses", "Eventi u krijua!");
      setCreateModalVisible(false);
      resetForm();
    } catch (e: any) {
      Alert.alert("Gabim", `Krijimi dështoi: ${e?.message || e}`);
    }
  }, [form, currentUid, resetForm]);

  const handleEdit = useCallback(async () => {
    if (!selectedEvent?.id || !form.name || !form.location || !form.date) {
      Alert.alert("Gabim", "Plotëso fushat e detyrueshme!");
      return;
    }
    if (selectedEvent.isFirebase && selectedEvent.ownerId && currentUid !== selectedEvent.ownerId) {
      Alert.alert("Pa leje", "Vetëm pronari mund ta editojë.");
      return;
    }

    const imageUrl = typeof form.image === "string" ? form.image : (form.image as any).uri;
    const updated: Partial<Event> = {
      name: form.name,
      location: form.location,
      date: form.date,
      description: form.description || "",
      price: Number(form.price) || 0,
      organizer: form.organizer || "",
      image: imageUrl,
      duration: form.duration || "",
      status: form.status || "",
    };

    if (selectedEvent.isFirebase) {
      setFirebaseEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? { ...e, ...updated, image: { uri: String(imageUrl) } } : e))
      );
      try {
        await updateDoc(doc(db, "events", selectedEvent.id), { ...updated, image: String(imageUrl), updatedAt: serverTimestamp() });
      } catch (err) {
        Alert.alert("Gabim", "Përditësimi dështoi.");
      }
    } else {
      const newEdits = { ...editedLocalEvents, [selectedEvent.id]: updated };
      setEditedLocalEvents(newEdits);
      await AsyncStorage.setItem("editedLocalEvents", JSON.stringify(newEdits));
    }

    Alert.alert("Sukses", "Eventi u përditësua!");
    setEditModalVisible(false);
    resetForm();
  }, [selectedEvent, form, currentUid, editedLocalEvents, resetForm]);

  const handleDelete = useCallback(() => {
    if (!selectedEvent?.id) return;
    if (selectedEvent.isFirebase && selectedEvent.ownerId && currentUid !== selectedEvent.ownerId) {
      Alert.alert("Pa leje", "Vetëm pronari mund ta fshijë.");
      return;
    }

    Alert.alert("Fshi", "A je i sigurt?", [
      { text: "Anulo", style: "cancel" },
      {
        text: "Fshi",
        style: "destructive",
        onPress: async () => {
          if (selectedEvent.isFirebase) {
            try {
              await deleteDoc(doc(db, "events", selectedEvent.id));
              Alert.alert("Sukses", "Eventi u fshi!");
            } catch (err) {
              Alert.alert("Gabim", "Fshirja dështoi.");
            }
          } else {
            const newDel = Array.from(new Set([...deletedLocalIds, selectedEvent.id]));
            setDeletedLocalIds(newDel);
            await AsyncStorage.setItem("deletedLocalIds", JSON.stringify(newDel));
            Alert.alert("Sukses", "Eventi u fshi!");
          }
          setDetailsModalVisible(false);
          setSelectedEvent(null);
        },
      },
    ]);
  }, [selectedEvent, currentUid, deletedLocalIds]);

  const openEditModal = useCallback(() => {
    if (!selectedEvent) return;
    if (selectedEvent.isFirebase && selectedEvent.ownerId && currentUid !== selectedEvent.ownerId) {
      Alert.alert("Pa leje", "Vetëm pronari mund ta editojë.");
      return;
    }

    setForm({
      name: selectedEvent.name,
      location: selectedEvent.location,
      date: selectedEvent.date,
      description: selectedEvent.description || "",
      price: typeof selectedEvent.price === "string" ? parseFloat(selectedEvent.price) || 0 : selectedEvent.price || 0,
      organizer: selectedEvent.organizer || "",
      image: typeof selectedEvent.image === "string" ? selectedEvent.image : (selectedEvent.image as any).uri,
      duration: selectedEvent.duration || "",
      status: selectedEvent.status || "",
    });

    if (detailsModalVisible) {
      setDetailsModalVisible(false);
      setTimeout(() => setEditModalVisible(true), 180);
    } else {
      setEditModalVisible(true);
    }
  }, [selectedEvent, currentUid, detailsModalVisible]);


  const processedLocalEvents = useMemo(() => {
    return (events as RawEvent[])
      .filter((e) => !deletedLocalIds.includes(e.id))
      .map((e) => {
        const edits = editedLocalEvents[e.id] || {};
        const imageUrl = edits.image ? (typeof edits.image === "string" ? edits.image : (edits.image as any).uri) : e.image;
        return {
          id: e.id,
          name: edits.name ?? e.name,
          location: edits.location ?? e.location,
          date: edits.date ?? e.date,
          description: edits.description ?? e.description,
          attendees: edits.attendees ?? e.attendees,
          price: edits.price !== undefined ? edits.price : e.price,
          organizer: edits.organizer ?? e.organized_by,
          image: { uri: imageUrl },
          isFirebase: false,
          duration: edits.duration ?? e.duration,
          status: edits.status ?? e.status,
        } as Event;
      });
  }, [deletedLocalIds, editedLocalEvents]);

  const allEvents = useMemo(() => [...processedLocalEvents, ...firebaseEvents], [processedLocalEvents, firebaseEvents]);
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const l = searchLocation.trim().toLowerCase();
    return allEvents.filter(
      (e) =>
        (!q || (e.name || "").toLowerCase().includes(q)) &&
        (!l || (e.location || "").toLowerCase().includes(l))
    );
  }, [allEvents, searchQuery, searchLocation]);


  const openDetailsModal = useCallback((event: Event) => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  }, []);

  const toggleSaveEvent = useCallback(async () => {
    if (!selectedEvent?.id) return;
    try {
      const json = await AsyncStorage.getItem("savedEvents");
      let saved: Event[] = json ? JSON.parse(json) : [];
      const exists = saved.some((e) => e.id === selectedEvent.id);
      if (exists) {
        saved = saved.filter((e) => e.id !== selectedEvent.id);
        setSavedEventIds((prev) => prev.filter((i) => i !== selectedEvent.id));
        Alert.alert("Hequr!", "Eventi u hoq nga të ruajturat.");
      } else {
        saved.push(selectedEvent);
        setSavedEventIds((prev) => [...prev, selectedEvent.id]);
        Alert.alert("Ruajtur!", "Eventi u ruajt.");
      }
      await AsyncStorage.setItem("savedEvents", JSON.stringify(saved));
      DeviceEventEmitter.emit("updateSavedEvents", saved);
    } catch (e) {
      Alert.alert("Gabim", "Ruajtja dështoi.");
    }
  }, [selectedEvent]);


  return (
    <View style={styles.container}>
      <NotLoggedInBanner variant="banner" position="top" />
      <Text style={styles.header}>SpotOn</Text>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.inputTouchable}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>
            {searchQuery || searchLocation
              ? `${searchQuery || "Any"} in ${searchLocation || "Any"}`
              : "Search by name or location..."}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.subheader}>Events</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setCreateModalVisible(true);
          }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openDetailsModal(item)} style={styles.card}>
            <Image source={safeImageSource(item.image)} style={styles.eventImage} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.infoRowCard}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <View style={styles.infoRowCard}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <View style={styles.infoRowCard}>
                <Ionicons name="cash-outline" size={16} color="#00b67f" />
                <Text style={styles.priceText}>
                  {typeof item.price === "number" ? `${item.price}€` : item.price}
                </Text>
              </View>
              {item.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found.</Text>
          </View>
        )}
      />

  
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeader}>Search Events</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={20} color="#999" />
              <TextInput
                style={styles.modalInput}
                placeholder="Event Name"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color="#999" />
              <TextInput
                style={styles.modalInput}
                placeholder="Location"
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.customButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customButton, styles.searchButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal animationType="slide" transparent visible={detailsModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.bottomSheet}>
            <ScrollView contentContainerStyle={styles.modalContentDetailsContainer}>
              {selectedEvent && (
                <>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalHeader}>{selectedEvent.name}</Text>
                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Image source={safeImageSource(selectedEvent.image)} style={styles.heroImage} />
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.infoText}>Date: {selectedEvent.date}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={24} color="#666" />
                    <Text style={styles.infoText}>Location: {selectedEvent.location}</Text>
                  </View>
                  {selectedEvent.attendees && (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={24} color="#666" />
                      <Text style={styles.infoText}>Attendees: {selectedEvent.attendees}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={24} color="#00b67f" />
                    <Text style={styles.infoText}>
                      Price: {typeof selectedEvent.price === "number" ? `${selectedEvent.price}€` : selectedEvent.price}
                    </Text>
                  </View>
                  {selectedEvent.organizer && (
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={24} color="#666" />
                      <Text style={styles.infoText}>Organized by: {selectedEvent.organizer}</Text>
                    </View>
                  )}
                  {selectedEvent.duration && (
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={24} color="#666" />
                      <Text style={styles.infoText}>Duration: {selectedEvent.duration}</Text>
                    </View>
                  )}
                  {selectedEvent.status && (
                    <View style={styles.infoRow}>
                      <Ionicons name="information-circle-outline" size={24} color="#666" />
                      <Text style={styles.infoText}>Status: {selectedEvent.status}</Text>
                    </View>
                  )}
                  {selectedEvent.isFirebase && (
                    <View style={styles.ownerInfoContainer}>
                      <Text style={styles.ownerInfoText}>
                        Owner: {selectedEvent.ownerId || "unknown"}
                        {currentUid ? ` (you: ${currentUid === selectedEvent.ownerId ? "owner" : "not owner"})` : ""}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={toggleSaveEvent} style={styles.saveContainer}>
                    <Ionicons
                      name={savedEventIds.includes(selectedEvent.id) ? "heart" : "heart-outline"}
                      size={30}
                      color={savedEventIds.includes(selectedEvent.id) ? "#FF0000" : "#666"}
                    />
                    <Text style={styles.saveText}>save</Text>
                  </TouchableOpacity>

                  {(selectedEvent.isFirebase ? selectedEvent.ownerId === currentUid : true) ? (
                    <View style={styles.crudButtons}>
                      <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                        <Ionicons name="pencil" size={20} color="white" />
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Ionicons name="trash" size={20} color="white" />
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.ownerInfo}>
                      <Text style={styles.ownerText}>Këtë event mund ta editojë vetëm pronari.</Text>
                    </View>
                  )}

                  {selectedEvent.description && (
                    <>
                      <Text style={styles.descriptionTitle}>Description:</Text>
                      <Text style={styles.description}>{selectedEvent.description}</Text>
                    </>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.customButton, styles.closeButton]} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={createModalVisible}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalHeader}>Create Event</Text>
                <TouchableOpacity onPress={() => { setCreateModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TextInput style={styles.modalInput} placeholder="Name*" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
                <TextInput style={styles.modalInput} placeholder="Location*" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
                <TextInput style={styles.modalInput} placeholder="Date (YYYY-MM-DD)*" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
                <TextInput style={styles.modalInput} placeholder="Price (€)" keyboardType="numeric" value={String(form.price)} onChangeText={(t) => setForm({ ...form, price: parseFloat(t) || 0 })} />
                <TextInput style={styles.modalInput} placeholder="Organizer" value={form.organizer} onChangeText={(t) => setForm({ ...form, organizer: t })} />
                <TextInput style={styles.modalInput} placeholder="Image URL" value={typeof form.image === "string" ? form.image : ""} onChangeText={(t) => setForm({ ...form, image: t })} />
                <TextInput style={[styles.modalInput, styles.multilineInput]} placeholder="Description" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
                <TextInput style={styles.modalInput} placeholder="Duration" value={form.duration} onChangeText={(t) => setForm({ ...form, duration: t })} />
                <TextInput style={styles.modalInput} placeholder="Status" value={form.status} onChangeText={(t) => setForm({ ...form, status: t })} />
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.customButton} onPress={() => { setCreateModalVisible(false); resetForm(); }}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.customButton, styles.searchButton]} onPress={handleCreate}>
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      <Modal animationType="slide" transparent visible={editModalVisible}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalHeader}>Edit Event</Text>
                <TouchableOpacity onPress={() => { setEditModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TextInput style={styles.modalInput} placeholder="Name*" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
                <TextInput style={styles.modalInput} placeholder="Location*" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
                <TextInput style={styles.modalInput} placeholder="Date (YYYY-MM-DD)*" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
                <TextInput style={styles.modalInput} placeholder="Price (€)" keyboardType="numeric" value={String(form.price)} onChangeText={(t) => setForm({ ...form, price: parseFloat(t) || 0 })} />
                <TextInput style={styles.modalInput} placeholder="Organizer" value={form.organizer} onChangeText={(t) => setForm({ ...form, organizer: t })} />
                <TextInput style={styles.modalInput} placeholder="Image URL" value={typeof form.image === "string" ? form.image : ""} onChangeText={(t) => setForm({ ...form, image: t })} />
                <TextInput style={[styles.modalInput, styles.multilineInput]} placeholder="Description" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
                <TextInput style={styles.modalInput} placeholder="Duration" value={form.duration} onChangeText={(t) => setForm({ ...form, duration: t })} />
                <TextInput style={styles.modalInput} placeholder="Status" value={form.status} onChangeText={(t) => setForm({ ...form, status: t })} />
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.customButton} onPress={() => { setEditModalVisible(false); resetForm(); }}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.customButton, styles.searchButton]} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50, backgroundColor: "#f2f4f8" },
  header: { fontSize: 36, fontWeight: "bold", marginBottom: 24, color: "#1a1a1a" },
  inputTouchable: { backgroundColor: "#fff", borderRadius: 32, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchText: { color: "#999", fontSize: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  subheader: { fontSize: 20, fontWeight: "600", color: "#333" },
  addButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 50 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: "hidden" },
  eventImage: { width: "100%", height: 160, resizeMode: "cover" },
  cardContent: { padding: 16 },
  name: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 8 },
  infoRowCard: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  date: { fontSize: 14, color: "#666", marginLeft: 6 },
  location: { fontSize: 14, color: "#666", marginLeft: 6 },
  priceText: { fontSize: 14, color: "#00b67f", fontWeight: "600", marginLeft: 6 },
  description: { fontSize: 13, color: "#555", marginTop: 8, lineHeight: 18 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width, maxHeight: height * 0.9 },
  bottomSheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, width, maxHeight: height * 0.9 },
  modalContentDetailsContainer: { padding: 20 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalHeader: { fontSize: 24, fontWeight: "bold", color: "#222", flex: 1, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, marginBottom: 16 },
  modalInput: { padding: 14, fontSize: 16, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", marginBottom: 12 },
  multilineInput: { height: 100, textAlignVertical: "top" },
  heroImage: { width: "100%", height: 200, borderRadius: 12, resizeMode: "cover", marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
  customButton: { backgroundColor: "#5a5a5a", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, flex: 1, marginHorizontal: 6, alignItems: "center" },
  searchButton: { backgroundColor: "#4CAF50" },
  closeButton: { backgroundColor: "#FF3B30", width: width - 40, margin: 20, marginTop: 0 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 16, color: "#333", marginLeft: 10, flex: 1 },
  descriptionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8, color: "#222" },
  saveContainer: { alignItems: "center", marginVertical: 16 },
  saveText: { fontSize: 14, color: "#666", textTransform: "lowercase" },
  crudButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 16, marginBottom: 20 },
  editButton: { flexDirection: "row", backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", flex: 1, marginRight: 8, justifyContent: "center" },
  deleteButton: { flexDirection: "row", backgroundColor: "#FF3B30", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", flex: 1, marginLeft: 8, justifyContent: "center" },
  ownerInfo: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#f0f0f0", borderRadius: 12, marginTop: 16, marginBottom: 20 },
  ownerText: { color: "#666", fontSize: 14, textAlign: "center", fontStyle: "italic" },
  ownerInfoContainer: { paddingHorizontal: 16, marginBottom: 6 },
  ownerInfoText: { color: "#666", fontSize: 13 },
});