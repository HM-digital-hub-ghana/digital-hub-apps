import { View, Text, StyleSheet } from 'react-native';

export default function ComplaintsFeedbackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaints & Feedback</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.note}>
        This project is not yet available. Check back later!
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
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

