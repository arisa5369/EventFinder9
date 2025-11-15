import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: January 1, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.sectionText}>
            SpotOn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.sectionText}>We collect information that you provide directly to us, including:</Text>
          <Text style={styles.listItem}>• Name and contact information (email, phone number)</Text>
          <Text style={styles.listItem}>• Profile information and preferences</Text>
          <Text style={styles.listItem}>• Payment information (processed securely through third-party providers)</Text>
          <Text style={styles.listItem}>• Event information you create or interact with</Text>
          <Text style={[styles.sectionText, { marginTop: 8 }]}>
            We also automatically collect certain information when you use our app, such as device information, usage data, and location information (if you grant permission).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.sectionText}>We use the information we collect to:</Text>
          <Text style={styles.listItem}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.listItem}>• Process transactions and send related information</Text>
          <Text style={styles.listItem}>• Send you technical notices and support messages</Text>
          <Text style={styles.listItem}>• Respond to your comments and questions</Text>
          <Text style={styles.listItem}>• Personalize your experience</Text>
          <Text style={styles.listItem}>• Send you marketing communications (with your consent)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell your personal information. We may share your information in the following circumstances:
          </Text>
          <Text style={styles.listItem}>• With event organizers for events you attend or create</Text>
          <Text style={styles.listItem}>• With service providers who assist us in operating our app</Text>
          <Text style={styles.listItem}>• When required by law or to protect our rights</Text>
          <Text style={styles.listItem}>• With your consent or at your direction</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.sectionText}>You have the right to:</Text>
          <Text style={styles.listItem}>• Access and receive a copy of your personal data</Text>
          <Text style={styles.listItem}>• Rectify inaccurate personal data</Text>
          <Text style={styles.listItem}>• Request deletion of your personal data</Text>
          <Text style={styles.listItem}>• Object to processing of your personal data</Text>
          <Text style={styles.listItem}>• Request restriction of processing</Text>
          <Text style={styles.listItem}>• Data portability</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Location Information</Text>
          <Text style={styles.sectionText}>
            If you grant permission, we collect location information to help you find events near you. You can disable location services at any time through your device settings or app settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            We use cookies and similar tracking technologies to track activity on our app and hold certain information. You can instruct your device to refuse all cookies or to indicate when a cookie is being sent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this Privacy Policy, please contact us at privacy@spoton.com.
          </Text>
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
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 4,
  },
});
