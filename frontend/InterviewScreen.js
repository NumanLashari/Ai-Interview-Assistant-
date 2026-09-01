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
  Platform 
} from 'react-native';
import { submitAnswers } from './api';

export default function InterviewScreen({ threadId, questions, onNext, onBack }) {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!ans1.trim() && !ans2.trim() && !ans3.trim()) {
      return alert("Please answer at least one question or use 'I don't know'.");
    }
    setLoading(true);
    try {
      const data = await submitAnswers(threadId, ans1, ans2, ans3);
      onNext(data);
    } catch (error) {
      alert("Failed to submit answers. Check backend connection.");
    }
    setLoading(false);
  };

  const handleDontKnow = (setAnsFunc) => {
    setAnsFunc("I don't know");
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
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backText}>← Exit Session</Text>
          </TouchableOpacity>
          <View style={styles.aiPoweredBadge}>
            <Text style={styles.badgeSparkle}>⚡</Text>
            <Text style={styles.badgeText}>LIVE ASSESSMENT</Text>
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Text style={styles.emoji}>🧠</Text>
            </View>
            <View style={styles.cardTextBox}>
              <Text style={styles.cardTitle}>Technical Evaluation</Text>
              <Text style={styles.cardSub}>Answer based on your experience and RAG guidelines.</Text>
            </View>
          </View>
          
          <View style={styles.questionDivider} />
          
          <Text style={styles.questionText}>{questions || "Loading assessment questions..."}</Text>
        </View>

        {/* Answer Box 1 */}
        <View style={styles.answerCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>QUESTION 1 RESPONSE</Text>
            <TouchableOpacity onPress={() => handleDontKnow(setAns1)} activeOpacity={0.7}>
              <Text style={styles.dontKnowText}>I don't know</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Type your detailed response here..."
            placeholderTextColor="#64748B"
            multiline
            value={ans1}
            onChangeText={setAns1}
            selectionColor="#818CF8"
          />
        </View>

        {/* Answer Box 2 */}
        <View style={styles.answerCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>QUESTION 2 RESPONSE</Text>
            <TouchableOpacity onPress={() => handleDontKnow(setAns2)} activeOpacity={0.7}>
              <Text style={styles.dontKnowText}>I don't know</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Type your detailed response here..."
            placeholderTextColor="#64748B"
            multiline
            value={ans2}
            onChangeText={setAns2}
            selectionColor="#818CF8"
          />
        </View>

        {/* Answer Box 3 */}
        <View style={styles.answerCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>QUESTION 3 RESPONSE</Text>
            <TouchableOpacity onPress={() => handleDontKnow(setAns3)} activeOpacity={0.7}>
              <Text style={styles.dontKnowText}>I don't know</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Type your detailed response here..."
            placeholderTextColor="#64748B"
            multiline
            value={ans3}
            onChangeText={setAns3}
            selectionColor="#818CF8"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={handleSubmit} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.btnText}>SUBMIT ROUND ANSWERS →</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  backText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  aiPoweredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B4B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#312E81' },
  badgeSparkle: { fontSize: 12, marginRight: 6 },
  badgeText: { color: '#818CF8', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  questionCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 20, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 44, height: 44, backgroundColor: '#312E81', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  emoji: { fontSize: 22 },
  cardTextBox: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#94A3B8', lineHeight: 15 },
  questionDivider: { height: 1, backgroundColor: '#334155', marginBottom: 16 },
  questionText: { fontSize: 14, color: '#F8FAFC', lineHeight: 22, fontWeight: '600' },
  answerCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  dontKnowText: { fontSize: 12, color: '#818CF8', fontWeight: '700' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#475569', borderRadius: 12, padding: 14, color: '#F8FAFC', fontSize: 14, minHeight: 90, textAlignVertical: 'top' },
  btn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnDisabled: { backgroundColor: '#3730A3' },
  btnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 }
});