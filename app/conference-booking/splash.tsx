import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from './theme/_colors';

// Native splash logo for Smartspace
const LOGO = require('../../assets/images/smartspace-logo.png');

export default function SmartspaceSplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/conference-booking');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: '70%',
    maxWidth: 360,
    aspectRatio: 5,
  },
});


