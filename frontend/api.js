const BASE_URL = 'http://192.168.2.162';

export async function startInterview(role) {
  const response = await fetch(`${BASE_URL}/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_message: role }),
  });
  if (!response.ok) throw new Error('API Error (startInterview)');
  return await response.json();
}

export async function submitAnswers(threadId, ans1, ans2, ans3) {
  const response = await fetch(`${BASE_URL}/interview/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      thread_id: threadId, 
      pending_answers: { answer1: ans1, answer2: ans2, answer3: ans3 } 
    }),
  });
  if (!response.ok) throw new Error('Failed to submit answers');
  return await response.json();
}

export async function continueInterview(threadId, continueChoice) {
  const response = await fetch(`${BASE_URL}/interview/continue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      thread_id: threadId, 
      continue_interview: continueChoice 
    }),
  });
  if (!response.ok) throw new Error('Failed to process continue decision');
  return await response.json();
}