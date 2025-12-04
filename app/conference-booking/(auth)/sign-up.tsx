import { View, Text, StyleSheet,Image } from 'react-native';
const LOGO = require("../../../assets/images/smartspace-logo.png");
export default function ConferenceBookingSignUp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Native sign-up page coming soon...</Text>
      <View style={styles.content}>
<Image source={LOGO} />
      </View>
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
  },

  content:{
    width: '100%',
    maxWidth: 420,
  }
});


