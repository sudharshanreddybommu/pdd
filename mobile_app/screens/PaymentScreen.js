import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PaymentScreen({ route, navigation }) {
  const { amount, doctor } = route.params || { amount: 500, doctor: 'Doctor' };
  const [image, setImage] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleVerify = () => {
    if (!image) {
      return Alert.alert("Error", "Please upload the payment screenshot first.");
    }
    
    setVerifying(true);
    // Simulate Backend Verification Delay
    setTimeout(() => {
      setVerifying(false);
      Alert.alert(
        "Payment Verified! ✅",
        "Your payment has been successfully verified. You can now fill the OP Form.",
        [{ text: "Continue to OP Form", onPress: () => navigation.replace('OPForm', { doctor }) }]
      );
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.amountCircle}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.amountText}>{amount}</Text>
        </View>
        <Text style={styles.statusText}>Payment to {doctor}</Text>
        <Text style={styles.infoText}>Please upload a screenshot of your successful PhonePe/UPI transaction to unlock the OP Form.</Text>
      </View>

      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadText}>Select Payment Screenshot</Text>
        </TouchableOpacity>
      )}

      {verifying ? (
        <View style={styles.verifyContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.verifyText}>Verifying Transaction with Admin...</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.submitBtn, !image && {backgroundColor: '#cbd5e1'}]} 
          onPress={handleVerify}
          disabled={!image}
        >
          <Text style={styles.submitBtnText}>Verify Payment & Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 30 },
  amountCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginBottom: 16, borderWidth: 2, borderColor: '#0ea5e9' },
  currency: { fontSize: 24, color: '#0ea5e9', fontWeight: 'bold', marginTop: -10 },
  amountText: { fontSize: 36, color: '#0ea5e9', fontWeight: 'bold' },
  statusText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  uploadBtn: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#0ea5e9', borderRadius: 16, height: 180, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f9ff', marginBottom: 30 },
  uploadIcon: { fontSize: 40, marginBottom: 10 },
  uploadText: { fontSize: 16, color: '#0ea5e9', fontWeight: '600' },
  imageContainer: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 30, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(239,68,68,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  submitBtn: { backgroundColor: '#0ea5e9', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  verifyContainer: { alignItems: 'center', padding: 20 },
  verifyText: { marginTop: 15, fontSize: 16, color: '#0ea5e9', fontWeight: '600' }
});
