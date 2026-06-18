import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logoutSuccess } from './redux/features/auth/authSlice';
import {
  setJobs,
  setCategories,
  setFavorites,
  addFavorite as addFavoriteAction,
  removeFavorite as removeFavoriteAction,
  upsertJob,
  removeJob,
} from './redux/features/home/homeSlice';

import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { RootNavigator } from './navigation/RootNavigator';
import {
  getJobs,
  logout,
  setCurrentUser,
  getCategories,
  getFavorites,
  addFavorite as addFavoriteApi,
  removeFavorite,
} from './api/jobsApi';

function areJobsEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  // Chỉ cần so sánh ID là đủ để biết dữ liệu có thay đổi không
  return a.every((jobA, index) => jobA.id === b[index].id);
}

export default function AppRoot() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: jobs, categories, favorites, favoriteIds: favoriteIdsArray } = useSelector((state) => state.home);
  const favoriteIds = useMemo(() => new Set(favoriteIdsArray), [favoriteIdsArray]);

  const [showingRegister, setShowingRegister] = useState(false);

  // Sync Redux user with jobsApi internal state
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Load categories and favorites when user is logged in
  useEffect(() => {
    if (user) {
      const loadExtras = async () => {
        try {
          const cats = await getCategories();
          dispatch(setCategories(cats));
          const favs = await getFavorites();
          dispatch(setFavorites(favs));
        } catch (err) {
          console.error('AppRoot load extras error:', err);
        }
      };
      loadExtras();
    } else {
      dispatch(setCategories([]));
      dispatch(setFavorites([]));
    }
  }, [user, dispatch]);

  // Fetch jobs periodically (separate effect to avoid prop drilling)
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let inFlight = false;

    const fetchJobs = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const data = await getJobs();
        if (cancelled) return;
        const nextJobs = Array.isArray(data) ? data : [];
        if (!areJobsEqual(jobs, nextJobs)) {
          dispatch(setJobs(nextJobs));
        }
      } catch (err) {
        console.error('AppRoot fetch jobs error:', err);
      } finally {
        inFlight = false;
      }
    };

    // Fetch immediately on mount
    fetchJobs();
    // Then poll every 4 seconds
    const intervalId = setInterval(fetchJobs, 4000);
    
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, jobs, dispatch]);

  const toggleFavorite = useCallback(async (jobId) => {
    if (!user) return;
    
    // Find if already favorited
    const existing = favorites.find(f => f.jobId === jobId);
    
    try {
      if (existing) {
        // Remove
        await removeFavorite(existing.id);
        dispatch(removeFavoriteAction(existing.id));
      } else {
        // Add
        const created = await addFavoriteApi(jobId);
        dispatch(addFavoriteAction(created));
      }
    } catch (err) {
      console.error('AppRoot toggle favorite error:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  }, [user, favorites, dispatch]);

  const upsertJobInState = useCallback((job) => {
    if (!job) return;
    dispatch(upsertJob(job));
  }, [dispatch]);

  const removeJobFromState = useCallback((jobId) => {
    dispatch(removeJob(jobId));
  }, [dispatch]);

  const handleLogin = async (loginUser) => {
    dispatch(loginSuccess(loginUser));
    setCurrentUser(loginUser);
    setShowingRegister(false);
  };

  const handleRegister = async (registeredUser) => {
    setShowingRegister(false);
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    logout();
    setShowingRegister(false);
  };

  if (!user) {
    if (showingRegister) {
      return (
        <SafeAreaProvider>
          <RegisterScreen
            onRegisterSuccess={handleRegister}
            onLoginPress={() => setShowingRegister(false)}
          />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <LoginScreen
          onLoginSuccess={handleLogin}
          onRegisterPress={() => setShowingRegister(true)}
        />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator
        jobs={jobs}
        favoriteIds={favoriteIds}
        toggleFavorite={toggleFavorite}
        user={user}
        categories={categories}
        favorites={favorites}
        removeJobFromState={removeJobFromState}
        upsertJobInState={upsertJobInState}
        dispatch={dispatch}
      />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
