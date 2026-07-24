import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function OPFormScreen({ route, navigation }) {
  const { doctor, hospital, specialization, scheduledDate, fee } = route.params || {
    doctor: 'Dr. OPMD Specialist',
    hospital: 'OPMD General Hospital',
    specialization: 'Oral Medicine & Radiology',
    scheduledDate: new Date().toLocaleString(),
    fee: '200'
  };

  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', phone: '', address: '',
    symptoms: '', bloodGroup: '', referredBy: '', idProof: ''
  });

  const generateOPNumber = () => {
    const now = new Date();
    return `OP${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleGeneratePDF = async () => {
    if (!formData.name || !formData.age || !formData.phone || !formData.symptoms) {
      return Alert.alert("Missing Fields", "Please fill all required fields marked with (*).");
    }

    const opNumber = generateOPNumber();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 13px; }

            /* ── PAGE WRAPPER ── */
            .page { padding: 20px 24px; max-width: 794px; margin: 0 auto; }

            /* ── TOP STRIP ── */
            .top-strip { background: #0369a1; height: 6px; border-radius: 2px; margin-bottom: 0; }

            /* ── HOSPITAL HEADER ── */
            .header { display: flex; align-items: center; justify-content: space-between;
                      border: 2px solid #0369a1; border-top: none; padding: 14px 18px 10px; margin-bottom: 0; }
            .hospital-logo { width: 60px; height: 60px; background: #0369a1; border-radius: 50%;
                             display: flex; align-items: center; justify-content: center;
                             font-size: 28px; color: #fff; flex-shrink: 0; }
            .hospital-info { flex: 1; text-align: center; padding: 0 12px; }
            .hospital-name { font-size: 22px; font-weight: bold; color: #0369a1; letter-spacing: 0.5px; }
            .hospital-sub { font-size: 11px; color: #475569; margin-top: 2px; }
            .hospital-contact { font-size: 10px; color: #64748b; margin-top: 4px; }
            .hospital-accreditation { text-align: right; font-size: 10px; color: #64748b; }
            .accred-badge { background: #f0f9ff; border: 1px solid #0369a1; border-radius: 4px;
                            padding: 3px 8px; font-size: 10px; color: #0369a1; font-weight: bold;
                            display: inline-block; margin-top: 4px; }

            /* ── OP TITLE BAR ── */
            .op-title-bar { background: #0369a1; color: white; text-align: center;
                            padding: 7px; font-size: 14px; font-weight: bold; letter-spacing: 2px;
                            border-left: 2px solid #0369a1; border-right: 2px solid #0369a1; }

            /* ── OP META ROW ── */
            .op-meta { display: flex; border: 2px solid #0369a1; border-top: none;
                       border-bottom: 2px solid #0369a1; }
            .op-meta-cell { flex: 1; padding: 8px 12px; border-right: 1px solid #cbd5e1; }
            .op-meta-cell:last-child { border-right: none; }
            .meta-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 2px; }
            .meta-val { font-size: 13px; font-weight: bold; color: #0f172a; }
            .op-number-val { color: #0369a1; font-size: 15px; }

            /* ── SECTION TITLE ── */
            .section { margin-top: 14px; }
            .section-title { background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: bold;
                             text-transform: uppercase; letter-spacing: 1px; padding: 5px 10px;
                             border-left: 4px solid #0369a1; margin-bottom: 8px; }

            /* ── INFO GRID ── */
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e2e8f0; }
            .info-cell { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
            .info-cell:nth-child(even) { border-right: none; }
            .info-cell.full { grid-column: 1 / -1; border-right: none; }
            .info-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 3px; }
            .info-val { font-size: 13px; color: #0f172a; font-weight: 500; min-height: 18px; }
            .info-val.highlight { color: #0369a1; font-weight: bold; }

            /* ── PAYMENT BOX ── */
            .payment-box { display: flex; justify-content: space-between; align-items: center;
                           background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px;
                           padding: 10px 16px; margin-top: 14px; }
            .payment-left { font-size: 13px; font-weight: bold; color: #166534; }
            .payment-right { font-size: 11px; color: #16a34a; }
            .payment-badge { background: #16a34a; color: white; padding: 4px 12px; border-radius: 20px;
                             font-size: 11px; font-weight: bold; }

            /* ── INSTRUCTIONS ── */
            .instructions { margin-top: 14px; background: #fff7ed; border: 1px solid #fed7aa;
                            border-radius: 6px; padding: 10px 14px; }
            .instructions-title { font-size: 11px; font-weight: bold; color: #c2410c;
                                   text-transform: uppercase; margin-bottom: 6px; }
            .instructions ol { padding-left: 16px; }
            .instructions li { font-size: 11px; color: #7c2d12; margin-bottom: 3px; line-height: 1.5; }

            /* ── SIGNATURE ROW ── */
            .sig-row { display: flex; justify-content: space-between; margin-top: 30px; gap: 20px; }
            .sig-box { flex: 1; text-align: center; }
            .sig-line { border-top: 1.5px solid #334155; margin-bottom: 5px; width: 100%; }
            .sig-label { font-size: 10px; color: #475569; }
            .sig-name { font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; }

            /* ── BOTTOM STRIP ── */
            .bottom-strip { background: #0369a1; height: 4px; border-radius: 2px; margin-top: 20px; }
            .footer-text { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 6px; }

            /* ── WATERMARK ── */
            .watermark { text-align: center; margin-top: 6px; }
            .watermark span { font-size: 10px; color: #cbd5e1; letter-spacing: 4px; }

            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="page">

            <!-- TOP COLOR STRIP -->
            <div class="top-strip"></div>

            <!-- HOSPITAL HEADER -->
            <div class="header">
              <div style="font-size:36px;">🏥</div>
              <div class="hospital-info">
                <div class="hospital-name">${hospital}</div>
                <div class="hospital-sub">Department of ${specialization}</div>
                <div class="hospital-contact">📞 1800-XXX-XXXX &nbsp;|&nbsp; ✉ info@opmd-hospital.in &nbsp;|&nbsp; 🌐 www.opmd-hospital.in</div>
              </div>
              <div class="hospital-accreditation">
                <div style="font-size:10px; color:#64748b;">Reg. No. MCI/2024/0892</div>
                <div class="accred-badge">NABH ACCREDITED</div>
                <div style="font-size:9px; color:#94a3b8; margin-top:4px;">ISO 9001:2015 Certified</div>
              </div>
            </div>

            <!-- OP TITLE BAR -->
            <div class="op-title-bar">OUTPATIENT (OP) REGISTRATION FORM</div>

            <!-- OP META ROW -->
            <div class="op-meta">
              <div class="op-meta-cell">
                <div class="meta-label">OP Number</div>
                <div class="meta-val op-number-val">${opNumber}</div>
              </div>
              <div class="op-meta-cell">
                <div class="meta-label">Date of Visit</div>
                <div class="meta-val">${dateStr}</div>
              </div>
              <div class="op-meta-cell">
                <div class="meta-label">Appointment Time</div>
                <div class="meta-val">${scheduledDate || timeStr}</div>
              </div>
              <div class="op-meta-cell">
                <div class="meta-label">Consulting Doctor</div>
                <div class="meta-val highlight">Dr. ${doctor}</div>
              </div>
              <div class="op-meta-cell">
                <div class="meta-label">Department</div>
                <div class="meta-val">${specialization}</div>
              </div>
            </div>

            <!-- PATIENT DETAILS SECTION -->
            <div class="section">
              <div class="section-title">👤 Patient Information</div>
              <div class="info-grid">
                <div class="info-cell">
                  <div class="info-label">Patient Full Name</div>
                  <div class="info-val highlight">${formData.name}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Age / Gender</div>
                  <div class="info-val">${formData.age} Years &nbsp;/&nbsp; ${formData.gender || 'Not Specified'}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Contact Number</div>
                  <div class="info-val">${formData.phone}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Blood Group</div>
                  <div class="info-val">${formData.bloodGroup || 'Not Specified'}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">ID Proof Type / Number</div>
                  <div class="info-val">${formData.idProof || 'Not Provided'}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Referred By</div>
                  <div class="info-val">${formData.referredBy || 'Self'}</div>
                </div>
                <div class="info-cell full">
                  <div class="info-label">Residential Address</div>
                  <div class="info-val">${formData.address || 'Not Provided'}</div>
                </div>
              </div>
            </div>

            <!-- CLINICAL SECTION -->
            <div class="section">
              <div class="section-title">🩺 Clinical Complaint / Chief Presenting Symptoms</div>
              <div class="info-grid">
                <div class="info-cell full">
                  <div class="info-label">Chief Complaint & Duration</div>
                  <div class="info-val">${formData.symptoms}</div>
                </div>
                <div class="info-cell full">
                  <div class="info-label">Doctor's Preliminary Notes</div>
                  <div class="info-val" style="min-height:40px; color:#94a3b8; font-style:italic;">
                    [To be filled by the physician during consultation]
                  </div>
                </div>
              </div>
            </div>

            <!-- PAYMENT CONFIRMATION -->
            <div class="payment-box">
              <div>
                <div class="payment-left">✅ Consultation Fee Paid &amp; Verified</div>
                <div class="payment-right">Amount: ₹${fee || '200'} &nbsp;|&nbsp; Mode: UPI / Digital Payment &nbsp;|&nbsp; Status: VERIFIED</div>
              </div>
              <div class="payment-badge">PAYMENT CONFIRMED</div>
            </div>

            <!-- INSTRUCTIONS -->
            <div class="instructions">
              <div class="instructions-title">⚠️ Important Instructions for Patient</div>
              <ol>
                <li>Please report to the <strong>Outpatient Reception Desk</strong> at least <strong>15 minutes before</strong> your scheduled appointment time.</li>
                <li>Carry all previous medical records, prescriptions, lab reports, and X-rays related to your condition.</li>
                <li>This OP form is valid <strong>only for today's date</strong>. For future visits, a new OP must be generated.</li>
                <li>Wear comfortable clothing and avoid applying any cosmetics or medication to the oral area before examination.</li>
                <li>In case of emergency or rescheduling, contact the helpline: <strong>1800-XXX-XXXX</strong></li>
              </ol>
            </div>

            <!-- SIGNATURES -->
            <div class="sig-row">
              <div class="sig-box">
                <div style="height:40px;"></div>
                <div class="sig-line"></div>
                <div class="sig-name">${formData.name}</div>
                <div class="sig-label">Patient / Guardian Signature</div>
              </div>
              <div class="sig-box">
                <div style="height:40px;"></div>
                <div class="sig-line"></div>
                <div class="sig-label">Reception Verified & Stamped</div>
              </div>
              <div class="sig-box">
                <div style="height:40px;"></div>
                <div class="sig-line"></div>
                <div class="sig-name">Dr. ${doctor}</div>
                <div class="sig-label">Consulting Doctor's Signature</div>
              </div>
            </div>

            <!-- BOTTOM STRIP -->
            <div class="bottom-strip"></div>
            <div class="footer-text">
              This is a computer-generated document. &nbsp;|&nbsp; OP No: ${opNumber} &nbsp;|&nbsp; Generated: ${dateStr} at ${timeStr}<br/>
              ${hospital} &nbsp;|&nbsp; NABH Accredited &nbsp;|&nbsp; For queries: info@opmd-hospital.in
            </div>
            <div class="watermark"><span>OPMD AI DETECTION PORTAL</span></div>

          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      Alert.alert("✅ Success", "Professional OP Form generated and ready to download!", [
        { text: "Return Home", onPress: () => navigation.popToTop() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏥</Text>
        <Text style={styles.headerTitle}>OP Form Registration</Text>
        <Text style={styles.headerSub}>Fill in your details to generate your official Outpatient Form for Dr. {doctor}</Text>
      </View>

      <View style={styles.form}>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 Patient Details</Text>
        </View>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} placeholder="e.g. Ramesh Kumar" placeholderTextColor="#94a3b8" />

        <View style={{flexDirection:'row', gap:10}}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Age *</Text>
            <TextInput style={styles.input} value={formData.age} onChangeText={(t) => setFormData({...formData, age: t})} placeholder="e.g. 35" keyboardType="numeric" placeholderTextColor="#94a3b8" />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.label}>Gender</Text>
            <TextInput style={styles.input} value={formData.gender} onChangeText={(t) => setFormData({...formData, gender: t})} placeholder="Male / Female" placeholderTextColor="#94a3b8" />
          </View>
        </View>

        <View style={{flexDirection:'row', gap:10}}>
          <View style={{flex:1}}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput style={styles.input} value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" placeholderTextColor="#94a3b8" />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.label}>Blood Group</Text>
            <TextInput style={styles.input} value={formData.bloodGroup} onChangeText={(t) => setFormData({...formData, bloodGroup: t})} placeholder="e.g. O+" placeholderTextColor="#94a3b8" />
          </View>
        </View>

        <Text style={styles.label}>ID Proof (Aadhaar / PAN / Voter ID)</Text>
        <TextInput style={styles.input} value={formData.idProof} onChangeText={(t) => setFormData({...formData, idProof: t})} placeholder="e.g. Aadhaar - XXXX XXXX 1234" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Referred By (Doctor / Hospital)</Text>
        <TextInput style={styles.input} value={formData.referredBy} onChangeText={(t) => setFormData({...formData, referredBy: t})} placeholder="e.g. Self / Dr. Name / Hospital" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Residential Address</Text>
        <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} placeholder="House No, Street, City, State, PIN" multiline numberOfLines={3} placeholderTextColor="#94a3b8" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🩺 Clinical Information</Text>
        </View>

        <Text style={styles.label}>Chief Complaint / Symptoms *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={formData.symptoms} onChangeText={(t) => setFormData({...formData, symptoms: t})} placeholder="Describe your main symptoms, since when, and severity..." multiline numberOfLines={4} placeholderTextColor="#94a3b8" />

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>✅</Text>
          <View style={{flex:1}}>
            <Text style={styles.infoTitle}>Payment Verified</Text>
            <Text style={styles.infoText}>Consultation fee of ₹{fee || '200'} has been confirmed by the doctor.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleGeneratePDF}>
          <Text style={styles.submitIcon}>📄</Text>
          <Text style={styles.submitText}>Generate Official OP Form PDF</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This document will be generated as a professionally formatted PDF that you can download, print, and present at the hospital reception.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0369a1', padding: 24, paddingTop: 40, alignItems: 'center' },
  headerIcon: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 13, color: '#bae6fd', textAlign: 'center', lineHeight: 18 },
  form: { padding: 20, paddingBottom: 50 },
  sectionHeader: { backgroundColor: '#e0f2fe', borderLeftWidth: 4, borderLeftColor: '#0369a1',
                   paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14, marginTop: 10, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#0369a1', textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
           padding: 13, fontSize: 15, marginBottom: 14, color: '#0f172a',
           shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  textArea: { height: 90, textAlignVertical: 'top' },
  infoBox: { backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#86efac', borderRadius: 10,
             padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 6 },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#166534' },
  infoText: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  submitBtn: { backgroundColor: '#0369a1', padding: 18, borderRadius: 14, flexDirection: 'row',
               alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4,
               shadowColor: '#0369a1', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8 },
  submitIcon: { fontSize: 22 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  disclaimer: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14, lineHeight: 16 }
});
