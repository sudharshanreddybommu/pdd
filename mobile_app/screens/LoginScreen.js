import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simulated Firebase Auth
    if (email && password) {
      navigation.replace('ScanQR');
    } else {
      alert('Please enter email and password');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🏥 OPMD</Text>
        <Text style={styles.subText}>Fast OP Appointments</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login Securely</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerLink}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0ea5e9' },
  logoContainer: { flex: 0.4, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  subText: { fontSize: 16, color: '#e0f2fe', marginTop: 10 },
  formContainer: { flex: 0.6, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, elevation: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 30 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  loginBtn: { backgroundColor: '#0ea5e9', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { color: '#0ea5e9', fontSize: 15, fontWeight: '600' }
});
