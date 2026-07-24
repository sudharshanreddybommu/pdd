import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const CURRENT_IP = '172.23.51.36';
const CURRENT_PORT = '5173';

export default function App() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);

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
      if (connectionError) { setConnectionError(false); return true; }
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack, url, showSettings, connectionError]);

  // Start connection timeout — show error if page doesn't load in 12 seconds
  const startConnectionTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setWebLoading(false);
      setConnectionError(true);
    }, 12000);
  };

  const clearConnectionTimeout = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleConnect = async () => {
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl) return;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }
    try {
      await AsyncStorage.setItem('WEB_APP_URL', formattedUrl);
      setUrl(formattedUrl);
      setConnectionError(false);
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
      setConnectionError(false);
      setShowSettings(false);
    } catch (e) {
      alert('Failed to clear URL');
    }
  };

  const handleRetry = () => {
    setConnectionError(false);
    setWebLoading(true);
    startConnectionTimeout();
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar style="light" backgroundColor="#0369a1" />
        <Text style={{ fontSize: 52, marginBottom: 16 }}>🦷</Text>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Initializing OralScan AI...</Text>
      </View>
    );
  }

  // ── SETTINGS / CONFIGURE SCREEN ──
  if (!url || showSettings) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="light" backgroundColor="#0369a1" />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.logoIcon}>🦷</Text>
            <Text style={styles.logoText}>OralScan AI</Text>
            <Text style={styles.subText}>Connect to the Web Portal on Your Phone</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔌 Configure Server URL</Text>
            <Text style={styles.cardSub}>Enter your computer's IP address and port below:</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 192.168.1.100:5174"
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholderTextColor="#94a3b8"
            />

            <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
              <Text style={styles.connectText}>🚀  Connect & Launch App</Text>
            </TouchableOpacity>

            {url ? (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setConnectionError(false); setShowSettings(false); }}>
                <Text style={styles.cancelText}>← Cancel & Go Back</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.quickTitle}>⚡ Quick Connect (tap to fill):</Text>
            <View style={styles.suggestionsGrid}>
              {[
                { label: `Current IP:${CURRENT_PORT}`, val: `${CURRENT_IP}:${CURRENT_PORT}` },
                { label: 'localhost:5174', val: 'localhost:5174' },
                { label: 'localhost:5173', val: 'localhost:5173' },
                { label: `Current IP:5173`, val: `${CURRENT_IP}:5173` },
              ].map((s) => (
                <TouchableOpacity key={s.val} style={styles.suggestBtn} onPress={() => setInputUrl(s.val)}>
                  <Text style={styles.suggestText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 How to Connect</Text>
            <Text style={styles.infoStep}>1. Run backend: <Text style={styles.code}>python app.py</Text> (port 5000)</Text>
            <Text style={styles.infoStep}>2. Run frontend: <Text style={styles.code}>npm run dev</Text> (port 5173/5174)</Text>
            <Text style={styles.infoStep}>3. Both PC & phone must be on same Wi-Fi</Text>
            <Text style={styles.infoStep}>4. Enter your PC's local IP above and connect</Text>
          </View>

          {url ? (
            <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>🗑️  Reset Saved Server URL</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── CONNECTION ERROR SCREEN ──
  if (connectionError) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar style="light" backgroundColor="#0369a1" />
        <Text style={{ fontSize: 60, marginBottom: 16 }}>📡</Text>
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorSub}>Could not reach:</Text>
        <Text style={styles.errorUrl}>{url}</Text>
        <Text style={styles.errorHint}>
          Make sure your backend and frontend servers are running on your PC, and both devices are on the same Wi-Fi network.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryText}>🔄  Retry Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeBtn} onPress={() => { setConnectionError(false); setShowSettings(true); }}>
          <Text style={styles.changeText}>⚙️  Change Server URL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── WEBVIEW SCREEN ──
  return (
    <View style={styles.webRoot}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>🦷 OralScan AI</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsIcon}>⚙️ Change Server</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
          onLoadStart={() => {
            setWebLoading(true);
            setConnectionError(false);
            startConnectionTimeout();
          }}
          onLoadEnd={() => {
            setWebLoading(false);
            clearConnectionTimeout();
          }}
          onError={() => {
            clearConnectionTimeout();
            setWebLoading(false);
            setConnectionError(true);
          }}
          onHttpError={() => {
            clearConnectionTimeout();
            setWebLoading(false);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          style={{ flex: 1 }}
        />
        {webLoading && (
          <View style={styles.webLoader}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🦷</Text>
            <ActivityIndicator size="large" color="#0369a1" />
            <Text style={styles.webLoadingText}>Loading OralScan AI...</Text>
            <Text style={styles.webLoadingUrl}>{url}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0369a1' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 40 },

  // Loading
  loadingText: { color: '#fff', fontSize: 16, marginTop: 14, fontWeight: '600' },

  // Header / Logo
  headerContainer: { alignItems: 'center', marginBottom: 28, marginTop: 30 },
  logoIcon: { fontSize: 52, marginBottom: 8 },
  logoText: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  subText: { color: '#bae6fd', fontSize: 14, marginTop: 6, textAlign: 'center' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 22, elevation: 8,
          shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.15, shadowRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15,
           borderWidth: 1.5, borderColor: '#e2e8f0', color: '#0f172a', marginBottom: 14 },
  connectBtn: { backgroundColor: '#0369a1', borderRadius: 12, padding: 15, alignItems: 'center', elevation: 2 },
  connectText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { marginTop: 12, padding: 10, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 18 },
  quickTitle: { fontSize: 12, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase',
                letterSpacing: 0.5, marginBottom: 10 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestBtn: { backgroundColor: '#f0f9ff', borderRadius: 8, padding: 10,
                borderWidth: 1, borderColor: '#bae6fd', alignItems: 'center', flex: 1, minWidth: '45%' },
  suggestText: { color: '#0369a1', fontSize: 12, fontWeight: '600' },

  // Info card
  infoCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, marginTop: 18 },
  infoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  infoStep: { color: '#bae6fd', fontSize: 12, marginBottom: 5, lineHeight: 18 },
  code: { color: '#7dd3fc', fontFamily: 'monospace' },

  // Disconnect
  disconnectBtn: { marginTop: 20, alignSelf: 'center', padding: 12 },
  disconnectText: { color: '#fca5a5', fontWeight: '600', fontSize: 14 },

  // Error Screen
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  errorSub: { fontSize: 14, color: '#bae6fd', marginBottom: 4 },
  errorUrl: { fontSize: 13, color: '#7dd3fc', fontFamily: 'monospace', marginBottom: 16,
              backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 },
  errorHint: { fontSize: 13, color: '#bae6fd', textAlign: 'center', lineHeight: 20,
               marginBottom: 28, paddingHorizontal: 10 },
  retryBtn: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
              marginBottom: 12, elevation: 2 },
  retryText: { color: '#0369a1', fontSize: 16, fontWeight: 'bold' },
  changeBtn: { padding: 12 },
  changeText: { color: '#bae6fd', fontSize: 14, fontWeight: '600' },

  // WebView
  webRoot: { flex: 1, backgroundColor: '#fff' },
  navBar: { height: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0',
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14 },
  navTitle: { fontSize: 15, fontWeight: 'bold', color: '#0369a1' },
  settingsBtn: { backgroundColor: '#f0f9ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
                 borderWidth: 1, borderColor: '#bae6fd' },
  settingsIcon: { fontSize: 12, color: '#0369a1', fontWeight: 'bold' },

  // Web Loader Overlay
  webLoader: { ...StyleSheet.absoluteFillObject, backgroundColor: '#f8fafc',
               justifyContent: 'center', alignItems: 'center' },
  webLoadingText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#0369a1' },
  webLoadingUrl: { marginTop: 6, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' },
});
