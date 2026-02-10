import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export const api = {
  registerUser: (data: any) => apiFetch('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),
  getUser: (id: string) => apiFetch(`/api/users/${id}`),
  joinInvite: (data: any) => apiFetch('/api/invite/join', { method: 'POST', body: JSON.stringify(data) }),
  getCouple: (id: string) => apiFetch(`/api/couple/${id}`),
  getCoupleStatus: (id: string) => apiFetch(`/api/couple/${id}/status`),
  getQuizzes: () => apiFetch('/api/quizzes'),
  getQuiz: (id: string) => apiFetch(`/api/quizzes/${id}`),
  submitQuiz: (data: any) => apiFetch('/api/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  getQuizResult: (id: string) => apiFetch(`/api/quiz/result/${id}`),
  getCoupleResults: (id: string) => apiFetch(`/api/quiz/results/${id}`),
};

export const storage = {
  setUserId: (id: string) => AsyncStorage.setItem('quissme_user_id', id),
  getUserId: () => AsyncStorage.getItem('quissme_user_id'),
  setCoupleId: (id: string) => AsyncStorage.setItem('quissme_couple_id', id),
  getCoupleId: () => AsyncStorage.getItem('quissme_couple_id'),
  setInviteCode: (code: string) => AsyncStorage.setItem('quissme_invite_code', code),
  getInviteCode: () => AsyncStorage.getItem('quissme_invite_code'),
  clear: () => AsyncStorage.multiRemove(['quissme_user_id', 'quissme_couple_id', 'quissme_invite_code']),
};
