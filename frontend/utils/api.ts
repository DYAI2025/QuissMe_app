import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  return res.json();
}

export const api = {
  registerUser: (d: any) => apiFetch('/api/users/register', { method: 'POST', body: JSON.stringify(d) }),
  getUser: (id: string) => apiFetch(`/api/users/${id}`),
  joinInvite: (d: any) => apiFetch('/api/invite/join', { method: 'POST', body: JSON.stringify(d) }),
  getCouple: (id: string) => apiFetch(`/api/couple/${id}`),
  getQuizzes: () => apiFetch('/api/quizzes'),
  getQuiz: (id: string) => apiFetch(`/api/quizzes/${id}`),
  getQuizWheel: (coupleId: string, userId: string) => apiFetch(`/api/quiz/wheel/${coupleId}/${userId}`),
  activateQuiz: (d: any) => apiFetch('/api/quiz/activate', { method: 'POST', body: JSON.stringify(d) }),
  submitQuiz: (d: any) => apiFetch('/api/quiz/submit', { method: 'POST', body: JSON.stringify(d) }),
  revealQuiz: (cycleId: string) => apiFetch(`/api/quiz/reveal/${cycleId}`, { method: 'POST' }),
  getCycle: (id: string) => apiFetch(`/api/cycle/${id}`),
  getCycles: (coupleId: string) => apiFetch(`/api/cycles/${coupleId}`),
  getGarden: (coupleId: string) => apiFetch(`/api/garden/${coupleId}`),
  placeGardenItem: (d: any) => apiFetch('/api/garden/place', { method: 'POST', body: JSON.stringify(d) }),
  getQuizResult: (id: string) => apiFetch(`/api/quiz/result/${id}`),
  // Stats API
  getDuoStats: (coupleId: string) => apiFetch(`/api/stats/${coupleId}`),
  getStatLibraryInfo: () => apiFetch('/api/stats/library/info'),
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
