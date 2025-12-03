import { View, Text, StyleSheet } from 'react-native';

export default function ConferenceBookingLogin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conference Booking - Login</Text>
      <Text style={styles.subtitle}>Native login page coming soon...</Text>
      <Text style={styles.note}>
        This page will be implemented in src/native/conference-and-visitors-booking/
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

