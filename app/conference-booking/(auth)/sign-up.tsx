import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { colors } from "../theme/_colors";



const LOGO = require("../../../assets/images/smartspace-logo.png");
export default function ConferenceBookingSignUp() {
  const router = useRouter();
    const [staffId, setStaffId] = useState("");
    const [password, setPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
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




<View style={styles.checkboxContainer}>

  <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)}>
    <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
      {agreeTerms && (
        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
      )}
    </View>
  </TouchableOpacity>

  <Text style={{ marginLeft: 10 }}>
    I agree to the{" "}
    <Text style={{ color: colors.primary }} onPress={() => console.log("Open terms page")}>
      Terms and Conditions
    </Text>
  </Text>

</View>

<TouchableOpacity style ={styles.signUpButton} onPress={handleSignUp} >
  <Text style ={styles.signUpButtonText} >Sign Up</Text></TouchableOpacity> 
  
  
<TouchableOpacity onPress={handleSignUp}>
  <Text>
    Already have an account{' '}
    <Text style={{ color: colors.primary }}>login</Text>
  </Text>

</TouchableOpacity>
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
    marginBottom: 24,
  },
  checkboxContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
},
checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});


