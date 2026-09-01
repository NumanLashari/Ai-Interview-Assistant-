import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

export default function ContinuePromptScreen({ onChoice }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      <View style={styles.card}>
        <Text style={styles.header}>PHASE COMPLETE</Text>
        <Text style={styles.title}>Continue Assessment?</Text>
        <Text style={styles.sub}>You have successfully completed this round block. Would you like to proceed to deeper technical inquiries or finalize your report?</Text>

        <TouchableOpacity style={[styles.btn, styles.yesBtn]} onPress={() => onChoice(true)}>
          <Text style={styles.yesText}>YES, CONTINUE INTERVIEW</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.noBtn]} onPress={() => onChoice(false)}>
          <Text style={styles.noText}>NO, GENERATE FINAL REPORT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#111827', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' },
  header: { color: '#14B8A6', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#F9FAFB', marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  btn: { width: '100%', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  yesBtn: { backgroundColor: '#14B8A6' },
  yesText: { color: '#030712', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  noBtn: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' },
  noText: { color: '#F9FAFB', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }
});