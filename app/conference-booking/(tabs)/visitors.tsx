import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/_colors';

export default function VisitorsTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visitors</Text>
      <Text style={styles.subtitle}>Visitors management will be implemented here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});


