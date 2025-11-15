import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleExpiryChange = (text) => {
    const numericText = text.replace(/\D/g, '');
    
    if (numericText.length <= 4) {
      if (numericText.length >= 2) {
        const formatted = numericText.slice(0, 2) + '/' + numericText.slice(2, 4);
        setExpiry(formatted);
      } else {
        setExpiry(numericText);
      }
    }
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (cardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (expiry.length !== 5 || !expiry.includes('/')) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }

    const last4 = cardNumber.slice(-4);
    const newCard = {
      id: Date.now().toString(),
      type: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      last4,
      expiry,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newCard]);
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setShowAddCard(false);
    Alert.alert('Success', 'Payment method added successfully');
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
  };

  const handleDeleteCard = (id) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter((card) => card.id !== id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {paymentMethods.length === 0 && !showAddCard ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No payment methods added</Text>
            <Text style={styles.emptyStateSubtext}>
              Add a payment method to get started
            </Text>
          </View>
        ) : (
          paymentMethods.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
              </View>
              <View style={styles.cardActions}>
                {!card.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(card.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="star-outline" size={20} color="#0a7ea4" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteCard(card.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {!showAddCard ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCard(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0a7ea4" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addCardForm}>
            <Text style={styles.formTitle}>Add New Card</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#999"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                placeholderTextColor="#999"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  maxLength={5}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddCard(false);
                  setCardNumber('');
                  setCardName('');
                  setExpiry('');
                  setCvv('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
                <Text style={styles.saveButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addCardForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});