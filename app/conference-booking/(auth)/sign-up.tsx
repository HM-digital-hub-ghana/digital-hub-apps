import { View, Text, StyleSheet,Image, TextInput, TouchableOpacity, } from 'react-native';
import { colors } from "../theme/_colors";
import { useState } from 'react';
import { useRouter } from "expo-router";



const LOGO = require("../../../assets/images/smartspace-logo.png");
export default function ConferenceBookingSignUp() {
  const router = useRouter();
    const [staffId, setStaffId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  const handleSignUp = () => {
    // For now, just navigate to the authenticated tabs; auth wiring can be added later.
      // router.replace("/conference-booking/(tabs)/index  ");
      }
  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <Image source={LOGO} resizeMode='contain' style={styles.logo}/>

        <View style={styles.formHeader}></View>
          <Text style={styles.title}>Create an Account </Text>
          <Text style={styles.subtitle}>Enter your details to create your account</Text>
<View style={styles.fieldGroup}>
  <Text style={styles.label}>Staff ID</Text>
           
  <TextInput 
  placeholder='DHG****'
   value={staffId} 
    onChangeText={setStaffId}
   placeholderTextColor="#9CA3AF" 
   style={styles.input}/>
</View>


<View style={styles.fieldGroup}>
  <Text style ={styles.label}>Password</Text>
  <TextInput 
  placeholder=" ••••••••"
    placeholderTextColor="#9CA3AF"
    style={styles.input}
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />
</View>

<TouchableOpacity onPress={handleSignUp}>
  <Text>
    Already have an account{' '}
    <Text style={{ color: colors.primary }}>login</Text>
  </Text>
</TouchableOpacity>  
<TouchableOpacity style ={styles.signUpButton} onPress={handleSignUp} >
  <Text style ={styles.signUpButtonText} >Sign Up</Text></TouchableOpacity> 

   </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  formHeader: {
    marginBottom: 32,
  },

  content:{
    width: "100%",
    maxWidth: 420,
  },
  logo:{
    width: 200,
    height: 44,
    alignSelf: "center",
    marginBottom: 56,
  },
  input:{
    borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.foreground,
        backgroundColor: "#F9FAFB",

  },
  label:{
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 8,
  },
  fieldGroup:{
    marginBottom: 16,
  },
  signUpButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
  },
});


