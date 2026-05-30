import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';

export default function ScanQRScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // Assuming QR contains Doctor/Hospital UPI Info
    const appointmentFee = 500; // Simulated dynamic amount
    const upiId = 'hospital@ybl';
    const payeeName = 'Appointment Fee';
    
    // Construct PhonePe / UPI deep link
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${appointmentFee}&cu=INR`;
    
    Alert.alert(
      "QR Detected",
      `Pay ₹${appointmentFee} for OP Appointment?`,
      [
        { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
        { 
          text: "Open PhonePe", 
          onPress: () => {
            // Attempt to open UPI app
            Linking.canOpenURL(upiUrl).then(supported => {
              if (supported) {
                Linking.openURL(upiUrl);
              } else {
                Alert.alert("Error", "No UPI app found. Please pay manually.");
              }
              // Proceed to screenshot upload screen regardless for this flow
              navigation.navigate('Payment', { amount: appointmentFee, doctor: 'Dr. Smith' });
            });
          }
        }
      ]
    );
  };

  if (hasPermission === null) return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text>No access to camera</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Scan Hospital QR</Text>
        <Text style={styles.subtitle}>Point your camera at the doctor's QR code to pay the OP fee</Text>
      </View>
      
      <View style={styles.cameraContainer}>
        {isFocused && (
          <Camera
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: ['qr'],
            }}
          />
        )}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>
      
      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
      
      {/* Dev skip button */}
      <TouchableOpacity style={{position:'absolute', bottom:20, padding:10}} onPress={() => navigation.navigate('Payment', { amount: 500, doctor: 'Dr. Smith' })}>
        <Text style={{color:'#0ea5e9'}}>Skip (Dev Mode)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center' },
  headerBox: { padding: 24, alignItems: 'center', width: '100%', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0ea5e9', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  cameraContainer: { flex: 1, width: '100%', position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  scanFrame: { width: 250, height: 250, borderWidth: 3, borderColor: '#0ea5e9', backgroundColor: 'transparent', borderRadius: 12 },
  rescanBtn: { position: 'absolute', bottom: 60, backgroundColor: '#0ea5e9', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, elevation: 5 },
  rescanText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
