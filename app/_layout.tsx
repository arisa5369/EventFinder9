import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { View, TouchableOpacity, Text } from "react-native";

function CustomDrawerContent() {
  const router = useRouter();

  const links = [
    { title: "Home", icon: "home-outline", path: "/(tabs)/discover" },
    { title: "Saved", icon: "heart-outline", path: "/(tabs)/saved" },
    { title: "Add Event", icon: "add-circle-outline", path: "/(tabs)/add-event" },
    { title: "Past Events", icon: "time-outline", path: "/(tabs)/past-events" },
    { title: "Tickets", icon: "ticket-outline", path: "/(tabs)/tickets" },
    { title: "Account", icon: "person-outline", path: "/(tabs)/account" },
    { title: "Settings", icon: "settings-outline", path: "/settings" },
  ];

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      {links.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(item.path as any)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 14,
            paddingTop:20, 
            paddingHorizontal: 20,
          }}
        >
          <Ionicons name={item.icon as any} size={22} color="#555" />
          <Text style={{ fontSize: 16, marginLeft: 15 }}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
        
          headerLeft: () => <DrawerToggleButton />,
        }}
        drawerContent={() => <CustomDrawerContent />}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title: "Event Finder",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            headerLeft: () => <DrawerToggleButton />,
          }}
        />
        <Drawer.Screen
          name="auth/login"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="auth/register"
          options={{ drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
