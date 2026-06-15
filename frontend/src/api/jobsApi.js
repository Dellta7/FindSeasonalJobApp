import { Platform } from 'react-native';

// Expo Go (mobile) thường không gọi được HTTPS self-signed.
// Backend trong repo này chạy:
// - HTTPS: https://localhost:4953
// - HTTP : http://localhost:4952 (fallback cho mobile)
const DEFAULT_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4952' : 'http://localhost:4952';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

// Simple in-memory auth storage (in production, use AsyncStorage)
let currentUser = null;

async function requestJson(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
    );
  }

  if (response.status === 204) return null;
  return await response.json();
}

function getAuthHeaders() {
  if (!currentUser) return {};
  return {
    'x-user-id': String(currentUser.id),
    'x-user-role': currentUser.role,
  };
}

// Auth functions
export async function login(email, password) {
  const user = await requestJson('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (user) {
    currentUser = user;
  }
  return user;
}

export async function register(fullName, email, password) {
  const user = await requestJson('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });
  return user;
}

export async function logout() {
  currentUser = null;
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export async function getUserInfo(userId) {
  return requestJson(`/auth/user/${userId}`);
}

export async function getUserJobs(userId) {
  return requestJson(`/auth/user/${userId}/jobs`);
}

export async function updateProfile(userId, data) {
  return requestJson(`/auth/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

export async function deleteUserAccount(userId) {
  return requestJson(`/auth/user/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function getInquiriesByApplicantId(userId) {
  return await requestJson(`/inquiries/applicant/${userId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
}

// Job functions
export function getJobs() {
  return requestJson('/jobs');
}

export function getJobById(id) {
  return requestJson(`/jobs/${id}`);
}

export function createJob(input, userId) {
  return requestJson('/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      title: input?.title,
      companyName: input?.companyName,
      location: input?.location,
      category: input?.category,
      salaryText: input?.salaryText ?? null,
      workTimeText: input?.workTimeText ?? null,
      description: input?.description ?? null,
      contactPhone: input?.contactPhone ?? null,
      status: input?.status ?? 'open',
      userId: userId ?? currentUser?.id ?? null,
    }),
  });
}

export function updateJob(id, patch) {
  return requestJson(`/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(patch ?? {}),
  });
}

export function deleteJob(id) {
  return requestJson(`/jobs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function createJobInquiry(jobId, input) {
  return await requestJson(`/jobs/${jobId}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: input?.fullName,
      phone: input?.phone,
      note: input?.note ?? null,
      userId: input?.userId ?? currentUser?.id ?? null,
    }),
  });
}

export async function getInquiriesByUserId(userId) {
  return await requestJson(`/inquiries/user/${userId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
}

export async function updateInquiryStatus(inquiryId, status) {
  return await requestJson(`/inquiries/${inquiryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
}

// Categories functions
export async function getCategories() {
  return requestJson('/categories');
}

// Favorites functions
export async function getFavorites() {
  return requestJson('/favorites', {
    headers: getAuthHeaders(),
  });
}

export async function addFavorite(jobId, note = null) {
  return requestJson('/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ jobId, note }),
  });
}

export async function removeFavorite(favoriteId) {
  return requestJson(`/favorites/${favoriteId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}


