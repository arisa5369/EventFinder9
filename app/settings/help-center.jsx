import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState({});

  const faqs = [
    {
      id: '1',
      question: 'How do I create an event?',
      answer: 'To create an event, go to the "Add Event" tab and fill in all the required information including event name, date, location, and description. Once you submit, your event will be visible to other users.',
    },
    {
      id: '2',
      question: 'How do I save events?',
      answer: 'You can save events by tapping the heart icon on any event card. Saved events will appear in your "Saved" tab for easy access later.',
    },
    {
      id: '3',
      question: 'How do I purchase tickets?',
      answer: 'To purchase tickets, navigate to the event details page and tap the "Buy Tickets" button. You can then select the number of tickets and complete the payment using your saved payment methods.',
    },
    {
      id: '4',
      question: 'Can I cancel my ticket purchase?',
      answer: 'Ticket cancellation policies vary by event. Please check the event details for specific cancellation terms. Generally, refunds are available up to 24 hours before the event.',
    },
    {
      id: '5',
      question: 'How do I update my profile?',
      answer: 'Go to the "Account" tab and tap the edit icon. You can then update your name, email, phone number, and profile picture.',
    },
    {
      id: '6',
      question: 'How do I change my password?',
      answer: 'Navigate to Settings > Account > Change Password. Enter your current password and your new password twice to confirm.',
    },
  ];

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => toggleItem(faq.id)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedItems[faq.id] ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedItems[faq.id] && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            If you can't find the answer you're looking for, please contact our support team.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/settings/contact-us')}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 12,
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});