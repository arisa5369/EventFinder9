// app/(tabs)/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4E73DF", // Ngjyra e aktivizuar
        tabBarInactiveTintColor: "#888", // Ngjyra jo-aktive
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },
      }}
    >
      {/* 1. DISCOVER */}
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. SAVED */}
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. ADD EVENT */}
      <Tabs.Screen
        name="add-event"
        options={{
          title: "Add Event",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4. EVENTS MAP – I RI */}
      <Tabs.Screen
        name="events-map"
        options={{
          title: "Events Map",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" size={size - 2} color={color} />
          ),
        }}
      />

      {/* 5. TICKETS */}
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Tickets",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Fshehur nga tab bar */}
      <Tabs.Screen name="account" options={{ href: null }} />
      <Tabs.Screen name="past-events" options={{ href: null }} />
    </Tabs>
  );
}