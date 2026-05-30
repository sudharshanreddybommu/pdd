import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  BackHandler, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const webViewRef = useRef(null);

  // Load saved URL from AsyncStorage on start
  useEffect(() => {
    const loadUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('WEB_APP_URL');
        if (savedUrl) {
          setUrl(savedUrl);
          setInputUrl(savedUrl);
        }
      } catch (e) {
        console.error('Failed to load URL', e);
      } finally {
        setLoading(false);
      }
    };
    loadUrl();
  }, []);

  // Handle hardware back button for Android WebView navigation
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior (exiting app)
      }
      if (url && !showSettings) {
        // If in WebView, double press back or prompt could exit, or default behavior
        return false;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [canGoBack, url, showSettings]);

  const handleConnect = async () => {
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl) return;

    // Auto prepend http:// if missing
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    try {
      await AsyncStorage.setItem('WEB_APP_URL', formattedUrl);
      setUrl(formattedUrl);
      setShowSettings(false);
    } catch (e) {
      alert('Failed to save URL');
    }
  };

  const handleDisconnect = async () => {
    try {
      await AsyncStorage.removeItem('WEB_APP_URL');
      setUrl('');
      setInputUrl('');
      setShowSettings(false);
    } catch (e) {
      alert('Failed to clear URL');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Initializing OPMD App...</Text>
      </View>
    );
  }

  // If no URL configured or Settings is open, show configuration screen
  if (!url || showSettings) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <StatusBar style="light" backgroundColor="#0ea5e9" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.formContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.logoText}>🏥 OPMD Portal</Text>
              <Text style={styles.subText}>Run the Web App directly on your Phone</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configure Server URL</Text>
              <Text style={styles.cardSub}>Enter your Vite server IP or hosted website address:</Text>
              
              <TextInput
                style={styles.input}
                placeholder="e.g. 192.168.1.100:5173 or website.com"
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
                <Text style={styles.connectText}>Connect Same-to-Same 🚀</Text>
              </TouchableOpacity>

              {url ? (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSettings(false)}>
                  <Text style={styles.cancelText}>Cancel & Go Back</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.divider} />
              
              <Text style={styles.quickTitle}>Quick Suggestions:</Text>
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity 
                  style={styles.suggestBtn} 
                  onPress={() => setInputUrl('192.168.1.100:5173')}
                >
                  <Text style={styles.suggestText}>Local IP (5173)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestBtn} 
                  onPress={() => setInputUrl('localhost:5173')}
                >
                  <Text style={styles.suggestText}>Localhost</Text>
                </TouchableOpacity>
              </View>
            </View>

            {url ? (
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>Reset Saved Server</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.webViewSafeArea}>
        {/* Floating Settings Button */}
        <View style={styles.navBar}>
          <TouchableOpacity 
            style={styles.settingsBtn} 
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsIcon}>⚙️ Change Server</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.webContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => setWebLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsBackForwardNavigationGestures={true}
            style={styles.webView}
          />
          
          {webLoading && (
            <View style={styles.webLoader}>
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0ea5e9' },
  safeArea: { flex: 1, justifyContent: 'center' },
  webViewSafeArea: { flex: 1, backgroundColor: '#ffffff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#ffffff', fontSize: 16, marginTop: 15, fontWeight: '500' },
  formContainer: { padding: 24, flex: 1, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subText: { color: '#e0f2fe', fontSize: 15, marginTop: 10, textAlign: 'center', fontWeight: '500' },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  cardSub: { fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, fontSize: 16, borderFocusColor: '#0ea5e9', borderWidth: 1, borderColor: '#cbd5e1', color: '#0f172a', marginBottom: 16 },
  connectBtn: { backgroundColor: '#0ea5e9', borderRadius: 12, padding: 16, alignItems: 'center' },
  connectText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { marginTop: 12, padding: 12, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#cbd5e1', marginVertical: 20 },
  quickTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  suggestionsContainer: { flexDirection: 'row', gap: 10 },
  suggestBtn: { flex: 1, backgroundColor: '#f0f9ff', borderHeight: 1, borderColor: '#bae6fd', borderRadius: 8, padding: 10, alignItems: 'center' },
  suggestText: { color: '#0ea5e9', fontSize: 13, fontWeight: '600' },
  disconnectBtn: { marginTop: 30, alignSelf: 'center', padding: 10 },
  disconnectText: { color: '#fca5a5', fontWeight: '600', fontSize: 15 },
  navBar: { height: 45, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 12 },
  settingsBtn: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  settingsText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  settingsIcon: { fontSize: 12, color: '#0ea5e9', fontWeight: 'bold' },
  webContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  webLoader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }
});
