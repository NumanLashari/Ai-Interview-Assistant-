import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal 
} from 'react-native';
import { startInterview } from './api';

export default function StartScreen({ onStart }) {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const handlePress = async () => {
    if (!role.trim()) return alert("Please enter a target job role.");
    setLoading(true);
    try {
      const data = await startInterview(role);
      onStart(data);
    } catch (error) {
      alert("Connection failed. Check local server IP.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.menuIconBox} 
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.menuIconText}>≡</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notifBox} 
            activeOpacity={0.7}
            onPress={() => setNotifVisible(true)}
          >
            <Text style={styles.notifIconText}>🔔</Text>
            <View style={styles.notifBadgeDot} />
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.aiPoweredBadge}>
            <Text style={styles.badgeSparkle}>✨</Text>
            <Text style={styles.badgeText}>AI POWERED</Text>
          </View>
          <Text style={styles.mainTitle}>AI Interview</Text>
          <Text style={styles.mainTitleGradient}>Assistant</Text>
          <Text style={styles.subtitle}>
            Practice smarter. Get better. Crack your dream job interview with RAG.
          </Text>
        </View>

        {/* Main Action Card */}
        <View style={styles.actionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.briefcaseIconBox}>
              <Text style={styles.briefcaseEmoji}>💼</Text>
            </View>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>Start New Interview</Text>
              <Text style={styles.cardSub}>Select a job role and start your AI session.</Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="e.g., Senior Python Developer"
            placeholderTextColor="#64748B"
            value={role}
            onChangeText={setRole}
            selectionColor="#818CF8"
          />

          <TouchableOpacity 
            style={[styles.btn, loading && styles.btnDisabled]} 
            onPress={handlePress} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnText}>START MOCK INTERVIEW →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* System Capabilities Card (Backend Aligned) */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresHeader}>SYSTEM CAPABILITIES</Text>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#312E81' }]}>
              <Text style={styles.featureEmoji}>🧠</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>AI Powered Feedback</Text>
              <Text style={styles.featureSub}>Get intelligent scoring and detailed evaluation reports.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#064E3B' }]}>
              <Text style={styles.featureEmoji}>⚡</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Adaptive Difficulty</Text>
              <Text style={styles.featureSub}>Questions adjust dynamically based on your performance.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#78350F' }]}>
              <Text style={styles.featureEmoji}>🛡️</Text>
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Role-Based RAG</Text>
              <Text style={styles.featureSub}>Trained on curated offline vector knowledge bases.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Interactive Side Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Navigation Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.drawerItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.drawerItemText}>🏠 Home Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setMenuVisible(false); alert("Session history synced from local SQLite backend."); }}>
              <Text style={styles.drawerItemText}>📊 Session History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { setMenuVisible(false); alert("Model: LangGraph RAG with Local Vector Storage."); }}>
              <Text style={styles.drawerItemText}>⚙️ System Info</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>

      {/* Interactive Notifications Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notifVisible}
        onRequestClose={() => setNotifVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notifCardItem}>
              <Text style={styles.notifItemTitle}>✨ System Ready</Text>
              <Text style={styles.notifItemSub}>ChromaDB vector store loaded successfully on local server.</Text>
            </View>
            <View style={styles.notifCardItem}>
              <Text style={styles.notifItemTitle}>🎯 Interview Tip</Text>
              <Text style={styles.notifItemSub}>Structure your answers using the STAR method for best scores.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setNotifVisible(false)} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuIconBox: { width: 40, height: 40, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  menuIconText: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  notifBox: { width: 40, height: 40, backgroundColor: '#1E293B', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', position: 'relative' },
  notifIconText: { fontSize: 16 },
  notifBadgeDot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, backgroundColor: '#4F46E5', borderRadius: 4 },
  headerSection: { marginBottom: 24 },
  aiPoweredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B4B', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#312E81', marginBottom: 12 },
  badgeSparkle: { fontSize: 12, marginRight: 6 },
  badgeText: { color: '#818CF8', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#F8FAFC', lineHeight: 36 },
  mainTitleGradient: { fontSize: 32, fontWeight: '900', color: '#818CF8', marginBottom: 10, lineHeight: 36 },
  subtitle: { fontSize: 14, color: '#94A3B8', lineHeight: 20 },
  actionCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 20, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  briefcaseIconBox: { width: 50, height: 50, backgroundColor: '#312E81', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  briefcaseEmoji: { fontSize: 24 },
  cardTextBox: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#94A3B8', lineHeight: 16 },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#475569', borderRadius: 12, padding: 14, color: '#F8FAFC', fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#3730A3' },
  btnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  featuresCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#334155' },
  featuresHeader: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  featureEmoji: { fontSize: 20 },
  featureTextBox: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginBottom: 2 },
  featureSub: { fontSize: 12, color: '#94A3B8', lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalDismissArea: { flex: 1 },
  drawerContainer: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#334155' },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  drawerTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' },
  closeText: { fontSize: 18, color: '#94A3B8', fontWeight: 'bold' },
  drawerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  drawerItemText: { fontSize: 14, color: '#E2E8F0', fontWeight: '600' },
  notifCardItem: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  notifItemTitle: { fontSize: 13, fontWeight: '700', color: '#818CF8', marginBottom: 4 },
  notifItemSub: { fontSize: 12, color: '#94A3B8', lineHeight: 16 }
});