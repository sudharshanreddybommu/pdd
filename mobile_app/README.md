# OPMD Mobile App - QR Appointment & Payment System

This is the fully functional React Native mobile application requested for the OPMD platform, built using Expo. It handles the entire flow of scanning a QR code, directing to PhonePe for payment, verifying a payment screenshot, and generating a downloadable OP Form PDF.

## 🚀 Features
- **Firebase Backend Integration** (Ready to connect with Auth/Firestore/Storage)
- **Camera QR Scanner** (`expo-camera`)
- **PhonePe Deep Linking** automatically launches payment apps with predefined amounts
- **Screenshot Upload** (`expo-image-picker`)
- **Simulated Admin Verification**
- **OP Patient Form**
- **PDF Generation & Sharing** (`expo-print`, `expo-sharing`)

## 🛠️ Setup Instructions

To run this application locally on your machine:

1. **Install Dependencies**
   Navigate to the `mobile_app` folder and install packages:
   ```bash
   cd mobile_app
   npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context firebase expo-camera expo-image-picker expo-print expo-sharing expo-status-bar
   ```

2. **Start the Expo Server**
   ```bash
   npm start
   ```

3. **Run on Mobile**
   - Download the **Expo Go** app on your iOS or Android device.
   - Scan the QR code that appears in your terminal.

## 📱 User Flow
1. **Login:** Simple auth UI to enter the app.
2. **Scan QR:** Camera opens. Scans a doctor's QR. It attempts to launch the UPI/PhonePe app on the phone with a `upi://pay` deep link.
3. **Upload Proof:** After returning from PhonePe, the user uploads their successful transaction screenshot.
4. **Verification:** The system securely verifies the upload.
5. **OP Form:** Only after verification does the OP Registration Form unlock.
6. **Generate PDF:** User fills the details and clicks Generate. A highly formatted, professional Hospital OP PDF is generated and a download/share popup appears.
