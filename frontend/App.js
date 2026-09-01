import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StartScreen from './StartScreen';
import InterviewScreen from './InterviewScreen';
import ContinuePromptScreen from './ContinuePromptScreen';
import FeedbackScreen from './FeedbackScreen';
import { continueInterview } from './api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('START'); // START, INTERVIEW, CONTINUE, FEEDBACK
  const [threadId, setThreadId] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState('');
  const [feedbackData, setFeedbackData] = useState(null);

  const handleStart = (data) => {
    setThreadId(data.thread_id);
    setCurrentQuestions(data.questions);
    setCurrentScreen('INTERVIEW');
  };

  const handleNextRound = (data) => {
    if (data.is_complete || data.phase === 'feedback') {
      setFeedbackData({ feedback: data.feedback, score: data.score });
      setCurrentScreen('FEEDBACK');
    } else if (data.phase === 'continue_prompt') {
      setCurrentScreen('CONTINUE');
    } else {
      setCurrentQuestions(data.questions);
      setCurrentScreen('INTERVIEW');
    }
  };

  const handleContinueChoice = async (wantToContinue) => {
    try {
      const data = await continueInterview(threadId, wantToContinue);
      handleNextRound(data);
    } catch (error) {
      alert("Error processing continue decision.");
    }
  };

  const resetApp = () => {
    setThreadId(null);
    setCurrentQuestions('');
    setFeedbackData(null);
    setCurrentScreen('START');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
        <View style={styles.content}>
          {currentScreen === 'START' && <StartScreen onStart={handleStart} />}
          {currentScreen === 'INTERVIEW' && (
            <InterviewScreen 
              threadId={threadId} 
              questions={currentQuestions} 
              onNext={handleNextRound} 
              onBack={resetApp} 
            />
          )}
          {currentScreen === 'CONTINUE' && (
            <ContinuePromptScreen onChoice={handleContinueChoice} />
          )}
          {currentScreen === 'FEEDBACK' && (
            <FeedbackScreen data={feedbackData} onRestart={resetApp} />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { flex: 1 }
});