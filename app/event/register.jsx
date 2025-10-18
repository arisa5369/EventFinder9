import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterTickets({ event, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("General Admission");
  const [showBilling, setShowBilling] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(true);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const generalPrice = event.price;
  const vipPrice = event.price * 1.8;
  const total =
    ticketType === "VIP Admission"
      ? vipPrice * quantity
      : generalPrice * quantity;

  const handlePlaceOrder = () => {
    alert(
      `✅ Order Confirmed!\n\nEvent: ${event.name}\nTickets: ${quantity} (${ticketType})\nTotal: €${total.toFixed(
        2
      )}\n\nThank you, ${name}!`
    );
    setShowBilling(false);
    onClose(); 
  };

  const handleClose = () => {
    setShowSelectModal(false);
    setShowBilling(false);
    onClose(); 
  };

  return (
    <View style={styles.container}>
      {/* Modal: Select Ticket */}
      <Modal
        visible={showSelectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose} 
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>🎫 Select Ticket</Text>

            <Text style={styles.label}>Ticket Type</Text>
            <View style={styles.ticketOptions}>
              {["General Admission", "VIP Admission"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.ticketButton,
                    ticketType === type && styles.ticketSelected,
                  ]}
                  onPress={() => setTicketType(type)}
                >
                  <Text
                    style={[
                      styles.ticketText,
                      ticketType === type && styles.ticketTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Quantity</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.btnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.total}>💰 Total: €{total.toFixed(2)}</Text>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                setShowBilling(true);
                setShowSelectModal(false);
              }}
            >
              <Text style={styles.confirmText}>Next</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Billing Info */}
      <Modal
        visible={showBilling}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose} 
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Billing Information</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#666"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Surname</Text>
            <TextInput
              placeholder="Enter your surname"
              placeholderTextColor="#666"
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#666"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.summary}>
              🎟 {quantity} × {ticketType}
              {"\n"}
              🕒 {event.date} | 📍 {event.location}
              {"\n"}
              💰 Total: €{total.toFixed(2)}
            </Text>

            <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
              <Text style={styles.placeText}>Place Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose} 
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    position: "relative",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: "#000",
    borderRadius: 10,
    zIndex: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  ticketOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  ticketButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  ticketSelected: {
    backgroundColor: "#4E73DF",
    borderColor: "#4E73DF",
  },
  ticketText: { color: "#000", fontSize: 14 },
  ticketTextSelected: { color: "#fff", fontWeight: "600" },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  btnText: { color: "#000", fontSize: 20, fontWeight: "bold" },
  quantity: { color: "#000", fontSize: 24, marginHorizontal: 10 },
  total: {
    color: "#000",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f9f9f9",
    color: "#000",
    borderRadius: 10,
    padding: 14,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  summary: {
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
    fontSize: 15,
  },
  placeBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  placeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: { color: "#000", fontSize: 16 },
});