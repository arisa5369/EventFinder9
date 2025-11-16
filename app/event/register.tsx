import { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 

interface Props {
  event: any;
  onClose: () => void;
  onPurchaseSuccess: (quantity: number) => void;
}

export default function RegisterTickets({ event, onClose, onPurchaseSuccess }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("General Admission");
  const [showBilling, setShowBilling] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const availableTickets = event.quantity || 0;
  const generalPrice = event.price;
  const vipPrice = event.price * 1.8;
  const total = ticketType === "VIP Admission" ? vipPrice * quantity : generalPrice * quantity;

  
  const loadUserData = async (user: User) => {
    setEmail(user.email || "");

    let name = "";

    if (user.displayName) {
      name = user.displayName.trim();
    } else {
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const first = data.name || data.firstName || "";
          const last = data.surname || data.lastName || "";
          name = `${first} ${last}`.trim();
        }
      } catch (err) {
        console.log("Error getting name from Firestore:", err);
      }
    }

    
    if (name && name !== " ") {
      setFullName(name);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData(user);
      } else {
        setFullName("");
        setEmail("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePlaceOrder = () => {
    if (quantity > availableTickets) {
      alert("There aren't enough tickets.");
      return;
    }
    if (!fullName.trim() || !email) {
      alert("Please fill in your name and email!");
      return;
    }

    alert(
      `The order was successfully confirmed.!\n\n${event.name}\n${quantity} × ${ticketType}\nTotal: €${total.toFixed(2)}\n\nThank you, ${fullName}!`
    );

    onPurchaseSuccess(quantity);
    onClose();
  };

  const handleClose = () => {
    setShowSelectModal(false);
    setShowBilling(false);
    onClose();
  };

  return (
    <View style={styles.container}>
    
      <Modal visible={showSelectModal} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Ticket</Text>

            <Text style={styles.label}>Ticket Type</Text>
            <View style={styles.ticketOptions}>
              {["General Admission", "VIP Admission"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.ticketButton, ticketType === type && styles.ticketSelected]}
                  onPress={() => setTicketType(type)}
                >
                  <Text style={[styles.ticketText, ticketType === type && styles.ticketTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sasia</Text>
            <View style={styles.counter}>
              <TouchableOpacity style={styles.btn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Text style={styles.btnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.btn, quantity >= availableTickets && styles.btnDisabled]}
                onPress={() => quantity < availableTickets && setQuantity(quantity + 1)}
                disabled={quantity >= availableTickets}
              >
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.total}>Total: €{total.toFixed(2)}</Text>
            <Text style={styles.availableText}>
              {availableTickets > 0 ? `${availableTickets} remaining tickets` : "There are no more tickets."}
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, quantity > availableTickets && styles.btnDisabled]}
              onPress={() => {
                if (quantity > availableTickets) {
                  alert("You have selected more tickets than there are available!");
                  return;
                }
                setShowBilling(true);
                setShowSelectModal(false);
              }}
            >
              <Text style={styles.confirmText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    
      <Modal visible={showBilling} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Billing information</Text>

            <Text style={styles.label}>First and Last Name</Text>
            <TextInput
              placeholder="First and Last Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="email@juaj.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.summary}>
              {quantity} × {ticketType}
              {"\n"}
              {event.date} | {event.location}
              {"\n"}
              Total: €{total.toFixed(2)}
            </Text>

            <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
              <Text style={styles.placeText}>Confirm Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { width: "100%" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "90%", backgroundColor: "#fff", borderRadius: 10, padding: 20, position: "relative", maxHeight: "80%", borderWidth: 1, borderColor: "#ccc" },
  closeBtn: { position: "absolute", top: 10, right: 10, padding: 8, backgroundColor: "#000", borderRadius: 10, zIndex: 10 },
  closeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalTitle: { color: "#000", fontSize: 20, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { color: "#000", fontSize: 16, fontWeight: "600", marginTop: 15 },
  ticketOptions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  ticketButton: { backgroundColor: "#f0f0f0", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: "#ccc" },
  ticketSelected: { backgroundColor: "#4E73DF", borderColor: "#4E73DF" },
  ticketText: { color: "#000", fontSize: 14 },
  ticketTextSelected: { color: "#fff", fontWeight: "600" },
  counter: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  btn: { backgroundColor: "#f0f0f0", borderRadius: 10, padding: 12, marginHorizontal: 15, borderWidth: 1, borderColor: "#ccc" },
  btnText: { color: "#000", fontSize: 20, fontWeight: "bold" },
  btnDisabled: { backgroundColor: "#ccc", opacity: 0.6 },
  quantity: { color: "#000", fontSize: 24, marginHorizontal: 10 },
  total: { color: "#000", fontSize: 18, marginBottom: 10, textAlign: "center", fontWeight: "600" },
  availableText: { color: "#e74c3c", fontSize: 14, textAlign: "center", marginBottom: 15, fontWeight: "600" },
  confirmBtn: { backgroundColor: "#4CAF50", padding: 14, borderRadius: 10, alignItems: "center" },
  confirmText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  input: { backgroundColor: "#f9f9f9", color: "#000", borderRadius: 10, padding: 14, marginTop: 5, borderWidth: 1, borderColor: "#ccc" },
  summary: { color: "#333", textAlign: "center", marginVertical: 20, fontSize: 15 },
  placeBtn: { backgroundColor: "#4CAF50", padding: 14, borderRadius: 10, alignItems: "center" },
  placeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelBtn: { marginTop: 10, alignItems: "center" },
  cancelText: { color: "#000", fontSize: 16 },
});