import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function OPFormScreen({ route, navigation }) {
  const { doctor } = route.params || { doctor: 'OPMD Doctor' };
  
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', phone: '', address: '', symptoms: '', bloodGroup: ''
  });

  const handleGeneratePDF = async () => {
    if (!formData.name || !formData.age || !formData.phone || !formData.symptoms) {
      return Alert.alert("Missing Fields", "Please fill all required fields (*).");
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #0ea5e9; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #64748b; }
            .receipt-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .receipt-title { font-weight: bold; color: #0369a1; font-size: 18px; }
            .grid { display: flex; flex-wrap: wrap; gap: 20px; }
            .box { flex: 1 1 45%; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
            .val { font-size: 16px; font-weight: bold; color: #0f172a; }
            .full { flex: 1 1 100%; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            .badge { display: inline-block; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">OPMD General Hospital</div>
            <div class="subtitle">Official Outpatient (OP) Record</div>
          </div>
          
          <div class="receipt-box">
            <div class="receipt-title">Appointment Details</div>
            <div style="margin-top: 5px;">Consulting Doctor: <strong>${doctor}</strong></div>
            <div style="margin-top: 5px;">Date: <strong>${new Date().toLocaleDateString()}</strong></div>
            <div class="badge">PAYMENT VERIFIED ✅</div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="label">Patient Name</div>
              <div class="val">${formData.name}</div>
            </div>
            <div class="box">
              <div class="label">Age & Gender</div>
              <div class="val">${formData.age} yrs, ${formData.gender || 'N/A'}</div>
            </div>
            <div class="box">
              <div class="label">Contact Number</div>
              <div class="val">${formData.phone}</div>
            </div>
            <div class="box">
              <div class="label">Blood Group</div>
              <div class="val">${formData.bloodGroup || 'Unknown'}</div>
            </div>
            <div class="box full">
              <div class="label">Presenting Symptoms</div>
              <div class="val">${formData.symptoms}</div>
            </div>
            <div class="box full">
              <div class="label">Address</div>
              <div class="val">${formData.address || 'N/A'}</div>
            </div>
          </div>

          <div class="footer">
            Generated securely by OPMD Mobile Platform.<br/>
            Please present this document at the hospital reception.
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      Alert.alert("Success", "OP Form generated successfully!", [
        { text: "Return Home", onPress: () => navigation.popToTop() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient OP Details</Text>
        <Text style={styles.headerSub}>Please fill in the patient's medical details for {doctor}. Payment is already verified.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Patient Name *</Text>
        <TextInput style={styles.input} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} placeholder="John Doe" />

        <View style={{flexDirection:'row', gap:10}}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Age *</Text>
            <TextInput style={styles.input} value={formData.age} onChangeText={(t) => setFormData({...formData, age: t})} placeholder="30" keyboardType="numeric" />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.label}>Gender</Text>
            <TextInput style={styles.input} value={formData.gender} onChangeText={(t) => setFormData({...formData, gender: t})} placeholder="M/F/O" />
          </View>
        </View>

        <Text style={styles.label}>Contact Number *</Text>
        <TextInput style={styles.input} value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>Blood Group</Text>
        <TextInput style={styles.input} value={formData.bloodGroup} onChangeText={(t) => setFormData({...formData, bloodGroup: t})} placeholder="O+" />

        <Text style={styles.label}>Symptoms / Reason for Visit *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={formData.symptoms} onChangeText={(t) => setFormData({...formData, symptoms: t})} placeholder="Describe symptoms..." multiline numberOfLines={4} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} placeholder="Full address" multiline numberOfLines={3} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleGeneratePDF}>
          <Text style={styles.submitText}>📄 Generate & Download OP Form</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#0ea5e9', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSub: { fontSize: 14, color: '#e0f2fe', lineHeight: 20 },
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#0ea5e9', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 3 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
